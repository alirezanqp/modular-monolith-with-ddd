import { ExecutionContextAccessor, HandlerRegistry, IExecutionContextAccessor, Mediator } from '@building-blocks/application';
import { BackgroundProcessor, createCommandFactory, createTypedEventFactory, DomainEventsDispatcher, InMemoryEventsBus, InboxAccessor, InboxProcessor, InternalCommandsAccessor, InternalCommandsProcessor, OutboxAccessor, OutboxProcessor, SqlConnectionFactory, UnitOfWork } from '@building-blocks/infrastructure';
import { NewUserRegisteredIntegrationEvent } from '@modules/registrations';
import { randomUUID } from 'crypto';
import { IAdministrationModule } from '../application/contracts/administration.module';
import { AcceptMeetingGroupProposalCommand } from '../application/meeting-group-proposals/accept-meeting-group-proposal.command';
import { AcceptMeetingGroupProposalCommandHandler } from '../application/meeting-group-proposals/accept-meeting-group-proposal.command-handler';
import { GetMeetingGroupProposalQuery } from '../application/meeting-group-proposals/get-meeting-group-proposal.query';
import { GetMeetingGroupProposalsQuery } from '../application/meeting-group-proposals/get-meeting-group-proposals.query';
import { GetMeetingGroupProposalQueryHandler, GetMeetingGroupProposalsQueryHandler } from '../application/meeting-group-proposals/get-meeting-group-proposals.query-handler';
import { RequestMeetingGroupProposalVerificationCommand } from '../application/meeting-group-proposals/request-meeting-group-proposal-verification.command';
import { RequestMeetingGroupProposalVerificationCommandHandler } from '../application/meeting-group-proposals/request-meeting-group-proposal-verification.command-handler';
import { CreateMemberCommand } from '../application/members/create-member.command';
import { CreateMemberCommandHandler } from '../application/members/create-member.command-handler';
import { MeetingGroupProposalAcceptedDomainEvent } from '../domain/meeting-group-proposals/events/meeting-group-proposal-accepted.domain-event';
import { MeetingGroupProposalAcceptedIntegrationEvent } from '../integration-events/meeting-group-proposal-accepted.integration-event';

export class AdministrationModuleFacade implements IAdministrationModule {
  constructor(private readonly mediator: Mediator) {}
  executeCommand<TResult>(command: never): Promise<TResult>;
  executeCommand(command: never): Promise<void>;
  executeCommand(command: never) { return this.mediator.send(command); }
  executeQuery<TResult>(query: never) { return this.mediator.query(query) as Promise<TResult>; }
}

export function bootstrapAdministrationModule(options: { connectionString: string; eventsBus: InMemoryEventsBus; executionContextAccessor?: IExecutionContextAccessor }) {
  const sql = new SqlConnectionFactory(options.connectionString);
  void import('./schema').then(({ ensureAdministrationSchema }) =>
    ensureAdministrationSchema(sql).catch((error) => {
      console.error('Failed to ensure administration schema', error);
    }),
  );
  const schema = 'administration';
  const outbox = new OutboxAccessor(schema);
  const inbox = new InboxAccessor(schema);
  const internalCommands = new InternalCommandsAccessor(schema);
  const domainEvents = new DomainEventsDispatcher();
  const unitOfWork = new UnitOfWork(sql, domainEvents, outbox, schema);
  const registry = new HandlerRegistry();
  const executionContext = options.executionContextAccessor ?? new ExecutionContextAccessor(null, 'administration');
  const mediator = new Mediator(registry, executionContext, unitOfWork, (work) => sql.withTransaction(async () => work()));

  registry.registerCommandHandler(AcceptMeetingGroupProposalCommand, new AcceptMeetingGroupProposalCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(RequestMeetingGroupProposalVerificationCommand, new RequestMeetingGroupProposalVerificationCommandHandler(sql, unitOfWork));
  registry.registerCommandHandler(CreateMemberCommand, new CreateMemberCommandHandler(sql));
  registry.registerQueryHandler(GetMeetingGroupProposalsQuery, new GetMeetingGroupProposalsQueryHandler(sql));
  registry.registerQueryHandler(GetMeetingGroupProposalQuery, new GetMeetingGroupProposalQueryHandler(sql));

  domainEvents.register(MeetingGroupProposalAcceptedDomainEvent.name, {
    async handle(e: MeetingGroupProposalAcceptedDomainEvent) {
      unitOfWork.enqueueIntegrationEvent(new MeetingGroupProposalAcceptedIntegrationEvent(
        e.meetingGroupProposalId, e.name, e.description, e.locationCity, e.locationCountryCode, e.proposalUserId,
      ));
    },
  });

  options.eventsBus.subscribe(NewUserRegisteredIntegrationEvent.name, {
    async handle(event: NewUserRegisteredIntegrationEvent) {
      await sql.withTransaction(async (client) => {
        await inbox.add(client, { id: event.id, occurredOn: event.occurredOn, type: event.constructor.name, data: JSON.stringify(event) });
      });
    },
  });

  // MeetingGroupProposed from meetings
  options.eventsBus.subscribe('MeetingGroupProposedIntegrationEvent', {
    async handle(event: any) {
      await sql.withTransaction(async (client) => {
        await inbox.add(client, { id: event.id, occurredOn: event.occurredOn, type: 'MeetingGroupProposedIntegrationEvent', data: JSON.stringify(event) });
      });
    },
  });

  const outboxProcessor = new OutboxProcessor(sql, outbox, options.eventsBus, createTypedEventFactory({
    [MeetingGroupProposalAcceptedIntegrationEvent.name]: MeetingGroupProposalAcceptedIntegrationEvent,
  }));
  const inboxProcessor = new InboxProcessor(sql, inbox, internalCommands, (type, data) => {
    if (type === NewUserRegisteredIntegrationEvent.name) {
      return { id: randomUUID(), type: CreateMemberCommand.name, data: { id: randomUUID(), memberId: data.userRegistrationId, login: data.login, email: data.email, firstName: data.firstName, lastName: data.lastName } };
    }
    if (type === 'MeetingGroupProposedIntegrationEvent') {
      return { id: randomUUID(), type: RequestMeetingGroupProposalVerificationCommand.name, data: { id: randomUUID(), meetingGroupProposalId: data.meetingGroupProposalId, name: data.name, description: data.description, locationCity: data.locationCity, locationCountryCode: data.locationCountryCode, proposalUserId: data.proposalUserId } };
    }
    return null;
  });
  const internalProcessor = new InternalCommandsProcessor(sql, internalCommands, mediator, createCommandFactory({
    [CreateMemberCommand.name]: CreateMemberCommand,
    [RequestMeetingGroupProposalVerificationCommand.name]: RequestMeetingGroupProposalVerificationCommand,
  }));

  const background = new BackgroundProcessor();
  background.start([
    { name: 'admin-outbox', intervalMs: 2000, work: () => outboxProcessor.process() },
    { name: 'admin-inbox', intervalMs: 2000, work: () => inboxProcessor.process() },
    { name: 'admin-internal', intervalMs: 2000, work: () => internalProcessor.process() },
  ]);

  return { facade: new AdministrationModuleFacade(mediator) as IAdministrationModule, stop: () => background.stop() };
}
