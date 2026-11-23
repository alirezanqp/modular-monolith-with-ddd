import { ExecutionContextAccessor, HandlerRegistry, IExecutionContextAccessor, Mediator } from '@building-blocks/application';
import { BackgroundProcessor, createCommandFactory, createTypedEventFactory, DomainEventsDispatcher, InMemoryEventsBus, InboxAccessor, InboxProcessor, InternalCommandsAccessor, InternalCommandsProcessor, OutboxAccessor, OutboxProcessor, SqlConnectionFactory, UnitOfWork } from '@building-blocks/infrastructure';
import { MeetingGroupProposalAcceptedIntegrationEvent } from '@modules/administration';
import { NewUserRegisteredIntegrationEvent } from '@modules/registrations';
import { randomUUID } from 'crypto';
import { IMeetingsModule } from '../application/contracts/meetings.module';
import { ProposeMeetingGroupCommand } from '../application/commands/propose-meeting-group.command';
import { CreateNewMeetingGroupCommand } from '../application/commands/create-new-meeting-group.command';
import { JoinToGroupCommand } from '../application/commands/join-to-group.command';
import { LeaveMeetingGroupCommand } from '../application/commands/leave-meeting-group.command';
import { EditMeetingGroupGeneralAttributesCommand } from '../application/commands/edit-meeting-group-general-attributes.command';
import { SetMeetingGroupExpirationDateCommand } from '../application/commands/set-meeting-group-expiration-date.command';
import { CreateMeetingCommand } from '../application/commands/create-meeting.command';
import { AddMeetingAttendeeCommand } from '../application/commands/add-meeting-attendee.command';
import { CancelMeetingCommand } from '../application/commands/cancel-meeting.command';
import { CreateMemberCommand } from '../application/commands/create-member.command';
import { AddMeetingCommentCommand } from '../application/commands/add-meeting-comment.command';
import * as Handlers from '../application/handlers/meetings.command-handlers';
import * as Q from '../application/queries/meetings.queries';
import * as QH from '../application/queries/meetings.query-handlers';
import { MeetingGroupProposedDomainEvent } from '../domain/meeting-group-proposals/events/meeting-group-proposed.domain-event';
import { MeetingAttendeeAddedDomainEvent } from '../domain/meetings/events/meeting-attendee-added.domain-event';
import { MeetingGroupProposedIntegrationEvent } from '../integration-events/meeting-group-proposed.integration-event';
import { MeetingAttendeeAddedIntegrationEvent } from '../integration-events/meeting-attendee-added.integration-event';

export class MeetingsModuleFacade implements IMeetingsModule {
  constructor(private readonly mediator: Mediator) {}
  executeCommand(command: never): Promise<void>;
  executeCommand<TResult>(command: never): Promise<TResult>;
  executeCommand(command: never) { return this.mediator.send(command); }
  executeQuery<TResult>(query: never) { return this.mediator.query(query) as Promise<TResult>; }
}

export function bootstrapMeetingsModule(options: { connectionString: string; eventsBus: InMemoryEventsBus; executionContextAccessor?: IExecutionContextAccessor }) {
  const sql = new SqlConnectionFactory(options.connectionString);
  const schema = 'meetings';
  const outbox = new OutboxAccessor(schema);
  const inbox = new InboxAccessor(schema);
  const internalCommands = new InternalCommandsAccessor(schema);
  const domainEvents = new DomainEventsDispatcher();
  const unitOfWork = new UnitOfWork(sql, domainEvents, outbox, schema);
  const registry = new HandlerRegistry();
  const executionContext = options.executionContextAccessor ?? new ExecutionContextAccessor(null, 'meetings');
  const mediator = new Mediator(registry, executionContext, unitOfWork, (work) => sql.withTransaction(async () => work()));

  registry.registerCommandHandlerWithResult(ProposeMeetingGroupCommand, new Handlers.ProposeMeetingGroupCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(CreateNewMeetingGroupCommand, new Handlers.CreateNewMeetingGroupCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(JoinToGroupCommand, new Handlers.JoinToGroupCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(LeaveMeetingGroupCommand, new Handlers.LeaveMeetingGroupCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(EditMeetingGroupGeneralAttributesCommand, new Handlers.EditMeetingGroupGeneralAttributesCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(SetMeetingGroupExpirationDateCommand, new Handlers.SetMeetingGroupExpirationDateCommandHandler(sql, unitOfWork));
  registry.registerCommandHandlerWithResult(CreateMeetingCommand, new Handlers.CreateMeetingCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(AddMeetingAttendeeCommand, new Handlers.AddMeetingAttendeeCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(CancelMeetingCommand, new Handlers.CancelMeetingCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(CreateMemberCommand, new Handlers.CreateMemberCommandHandler(sql));
  registry.registerCommandHandlerWithResult(AddMeetingCommentCommand, new Handlers.AddMeetingCommentCommandHandler(sql, unitOfWork));

  registry.registerQueryHandler(Q.GetAllMeetingGroupsQuery, new QH.GetAllMeetingGroupsQueryHandler(sql));
  registry.registerQueryHandler(Q.GetMeetingGroupDetailsQuery, new QH.GetMeetingGroupDetailsQueryHandler(sql));
  registry.registerQueryHandler(Q.GetAuthenticationMemberMeetingGroupsQuery, new QH.GetAuthenticationMemberMeetingGroupsQueryHandler(sql));
  registry.registerQueryHandler(Q.GetAllMeetingGroupProposalsQuery, new QH.GetAllMeetingGroupProposalsQueryHandler(sql));
  registry.registerQueryHandler(Q.GetMemberMeetingGroupProposalsQuery, new QH.GetMemberMeetingGroupProposalsQueryHandler(sql));
  registry.registerQueryHandler(Q.GetMeetingDetailsQuery, new QH.GetMeetingDetailsQueryHandler(sql));
  registry.registerQueryHandler(Q.GetMeetingAttendeesQuery, new QH.GetMeetingAttendeesQueryHandler(sql));
  registry.registerQueryHandler(Q.GetAuthenticatedMemberMeetingsQuery, new QH.GetAuthenticatedMemberMeetingsQueryHandler(sql));
  registry.registerQueryHandler(Q.GetMeetingCommentsQuery, new QH.GetMeetingCommentsQueryHandler(sql));
  registry.registerQueryHandler(Q.GetAllCountriesQuery, new QH.GetAllCountriesQueryHandler(sql));

  domainEvents.register(MeetingGroupProposedDomainEvent.name, {
    async handle(e: MeetingGroupProposedDomainEvent) {
      unitOfWork.enqueueIntegrationEvent(new MeetingGroupProposedIntegrationEvent(
        e.meetingGroupProposalId, e.name, e.description, e.locationCity, e.locationCountryCode, e.proposalUserId,
      ));
    },
  });
  domainEvents.register(MeetingAttendeeAddedDomainEvent.name, {
    async handle(e: MeetingAttendeeAddedDomainEvent) {
      if (e.feeValue != null && e.feeValue > 0) {
        unitOfWork.enqueueIntegrationEvent(new MeetingAttendeeAddedIntegrationEvent(
          e.meetingId, e.attendeeId, e.feeValue, e.feeCurrency,
        ));
      }
    },
  });

  const subscribeInbox = (typeName: string) => {
    options.eventsBus.subscribe(typeName, {
      async handle(event: any) {
        await sql.withTransaction(async (client) => {
          await inbox.add(client, { id: event.id, occurredOn: event.occurredOn, type: typeName, data: JSON.stringify(event) });
        });
      },
    });
  };
  subscribeInbox(NewUserRegisteredIntegrationEvent.name);
  subscribeInbox(MeetingGroupProposalAcceptedIntegrationEvent.name);
  subscribeInbox('SubscriptionPaymentPaidIntegrationEvent');

  const outboxProcessor = new OutboxProcessor(sql, outbox, options.eventsBus, createTypedEventFactory({
    [MeetingGroupProposedIntegrationEvent.name]: MeetingGroupProposedIntegrationEvent,
    [MeetingAttendeeAddedIntegrationEvent.name]: MeetingAttendeeAddedIntegrationEvent,
  }));
  const inboxProcessor = new InboxProcessor(sql, inbox, internalCommands, (type, data) => {
    if (type === NewUserRegisteredIntegrationEvent.name) {
      return { id: randomUUID(), type: CreateMemberCommand.name, data: { id: randomUUID(), memberId: data.userRegistrationId, login: data.login, email: data.email, firstName: data.firstName, lastName: data.lastName } };
    }
    if (type === MeetingGroupProposalAcceptedIntegrationEvent.name) {
      return { id: randomUUID(), type: CreateNewMeetingGroupCommand.name, data: { id: randomUUID(), meetingGroupProposalId: data.meetingGroupProposalId, name: data.name, description: data.description, locationCity: data.locationCity, locationCountryCode: data.locationCountryCode, proposalUserId: data.proposalUserId } };
    }
    if (type === 'SubscriptionPaymentPaidIntegrationEvent') {
      return { id: randomUUID(), type: SetMeetingGroupExpirationDateCommand.name, data: { id: randomUUID(), meetingGroupId: data.payerId, dateTo: data.expirationDate } };
    }
    return null;
  });
  const internalProcessor = new InternalCommandsProcessor(sql, internalCommands, mediator, createCommandFactory({
    [CreateMemberCommand.name]: CreateMemberCommand,
    [CreateNewMeetingGroupCommand.name]: CreateNewMeetingGroupCommand,
    [SetMeetingGroupExpirationDateCommand.name]: SetMeetingGroupExpirationDateCommand,
  }));

  const background = new BackgroundProcessor();
  background.start([
    { name: 'meetings-outbox', intervalMs: 2000, work: () => outboxProcessor.process() },
    { name: 'meetings-inbox', intervalMs: 2000, work: () => inboxProcessor.process() },
    { name: 'meetings-internal', intervalMs: 2000, work: () => internalProcessor.process() },
  ]);

  return { facade: new MeetingsModuleFacade(mediator) as IMeetingsModule, stop: () => background.stop() };
}
