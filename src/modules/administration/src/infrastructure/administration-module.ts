import {
  HandlerRegistry,
  IAdministrationModule,
  ICommand,
  ICommandWithResult,
  IExecutionContextAccessor,
  IQuery,
  Mediator,
} from '@building-blocks/application';
import {
  BackgroundProcessor,
  createCommandFactory,
  createTypedEventFactory,
  DomainEventsDispatcher,
  IEventsBus,
  InboxAccessor,
  InboxProcessor,
  InternalCommandsAccessor,
  InternalCommandsProcessor,
  OutboxAccessor,
  OutboxProcessor,
  serialize,
  SqlConnectionFactory,
  UnitOfWork,
} from '@building-blocks/infrastructure';
import { randomUUID } from 'crypto';
import { AcceptMeetingGroupProposalCommand } from '../application/meeting-group-proposals/accept-meeting-group-proposal.command';
import { AcceptMeetingGroupProposalCommandHandler } from '../application/meeting-group-proposals/accept-meeting-group-proposal.handler';
import { GetMeetingGroupProposalQueryHandler } from '../application/meeting-group-proposals/get-meeting-group-proposal.handler';
import { GetMeetingGroupProposalQuery } from '../application/meeting-group-proposals/get-meeting-group-proposal.query';
import { GetMeetingGroupProposalsQueryHandler } from '../application/meeting-group-proposals/get-meeting-group-proposals.handler';
import { GetMeetingGroupProposalsQuery } from '../application/meeting-group-proposals/get-meeting-group-proposals.query';
import { MeetingGroupProposalAcceptedNotificationHandler } from '../application/meeting-group-proposals/meeting-group-proposal-accepted.notification-handler';
import { RequestMeetingGroupProposalVerificationCommand } from '../application/meeting-group-proposals/request-meeting-group-proposal-verification.command';
import { RequestMeetingGroupProposalVerificationCommandHandler } from '../application/meeting-group-proposals/request-meeting-group-proposal-verification.handler';
import { CreateMemberCommand } from '../application/members/create-member.command';
import { CreateMemberCommandHandler } from '../application/members/create-member.handler';
import { MeetingGroupProposalAcceptedDomainEvent } from '../domain/meeting-group-proposals/events/meeting-group-proposal-accepted.domain-event';
import { MeetingGroupProposalAcceptedIntegrationEvent } from '../integration-events/meeting-group-proposal-accepted.integration-event';
import { MeetingGroupProposalRepository } from './domain/meeting-group-proposal.repository';
import { MemberRepository } from './domain/member.repository';
import { ensureAdministrationSchema } from './schema';

const SCHEMA = 'administration';

export interface AdministrationModuleDeps {
  sqlConnectionFactory: SqlConnectionFactory;
  eventsBus: IEventsBus;
  executionContextAccessor: IExecutionContextAccessor;
  backgroundProcessor?: BackgroundProcessor;
}

export class AdministrationModuleFacade implements IAdministrationModule {
  constructor(private readonly mediator: Mediator) {}

  executeCommand(command: ICommand): Promise<void>;
  executeCommand<TResult>(command: ICommandWithResult<TResult>): Promise<TResult>;
  executeCommand(command: ICommand): Promise<unknown> {
    return this.mediator.send(command);
  }

  executeQuery<TResult>(query: IQuery<TResult>): Promise<TResult> {
    return this.mediator.query(query);
  }
}

export async function bootstrapAdministrationModule(
  deps: AdministrationModuleDeps,
): Promise<AdministrationModuleFacade> {
  await ensureAdministrationSchema(deps.sqlConnectionFactory);

  const outboxAccessor = new OutboxAccessor(SCHEMA);
  const inboxAccessor = new InboxAccessor(SCHEMA);
  const internalCommandsAccessor = new InternalCommandsAccessor(SCHEMA);
  const domainEventsDispatcher = new DomainEventsDispatcher();
  const unitOfWork = new UnitOfWork(
    deps.sqlConnectionFactory,
    domainEventsDispatcher,
    outboxAccessor,
    SCHEMA,
  );

  const proposalRepository = new MeetingGroupProposalRepository(deps.sqlConnectionFactory);
  const memberRepository = new MemberRepository(deps.sqlConnectionFactory);

  domainEventsDispatcher.register(
    MeetingGroupProposalAcceptedDomainEvent.name,
    new MeetingGroupProposalAcceptedNotificationHandler(proposalRepository, unitOfWork),
  );

  const registry = new HandlerRegistry();
  registry.registerCommandHandlerWithResult(
    RequestMeetingGroupProposalVerificationCommand,
    new RequestMeetingGroupProposalVerificationCommandHandler(proposalRepository, unitOfWork),
  );
  registry.registerCommandHandler(
    AcceptMeetingGroupProposalCommand,
    new AcceptMeetingGroupProposalCommandHandler(
      proposalRepository,
      deps.executionContextAccessor,
      unitOfWork,
    ),
  );
  registry.registerCommandHandler(
    CreateMemberCommand,
    new CreateMemberCommandHandler(memberRepository, unitOfWork),
  );
  registry.registerQueryHandler(
    GetMeetingGroupProposalQuery,
    new GetMeetingGroupProposalQueryHandler(deps.sqlConnectionFactory),
  );
  registry.registerQueryHandler(
    GetMeetingGroupProposalsQuery,
    new GetMeetingGroupProposalsQueryHandler(deps.sqlConnectionFactory),
  );

  const mediator = new Mediator(
    registry,
    deps.executionContextAccessor,
    unitOfWork,
    (work) => deps.sqlConnectionFactory.withTransaction(async () => work()),
  );

  const outboxProcessor = new OutboxProcessor(
    deps.sqlConnectionFactory,
    outboxAccessor,
    deps.eventsBus,
    createTypedEventFactory({
      MeetingGroupProposalAcceptedIntegrationEvent,
    }),
  );

  const inboxProcessor = new InboxProcessor(
    deps.sqlConnectionFactory,
    inboxAccessor,
    internalCommandsAccessor,
    (type, data) => {
      if (type === 'MeetingGroupProposedIntegrationEvent') {
        return {
          id: randomUUID(),
          type: RequestMeetingGroupProposalVerificationCommand.name,
          data: {
            id: randomUUID(),
            meetingGroupProposalId: data.meetingGroupProposalId,
            name: data.name,
            description: data.description,
            locationCity: data.locationCity,
            locationCountryCode: data.locationCountryCode,
            proposalUserId: data.proposalUserId,
            proposalDate: data.proposalDate,
          },
        };
      }
      if (type === 'NewUserRegisteredIntegrationEvent') {
        return {
          id: randomUUID(),
          type: CreateMemberCommand.name,
          data: {
            id: randomUUID(),
            memberId: data.userId,
            login: data.login,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            name: data.name,
          },
        };
      }
      return null;
    },
  );

  const internalCommandsProcessor = new InternalCommandsProcessor(
    deps.sqlConnectionFactory,
    internalCommandsAccessor,
    mediator,
    createCommandFactory({
      RequestMeetingGroupProposalVerificationCommand,
      CreateMemberCommand,
    }),
  );

  deps.eventsBus.subscribe('MeetingGroupProposedIntegrationEvent', {
    handle: async (event) => {
      await deps.sqlConnectionFactory.withTransaction(async (client) => {
        const exists = await inboxAccessor.exists(client, event.id);
        if (exists) return;
        await inboxAccessor.add(client, {
          id: event.id,
          occurredOn: event.occurredOn,
          type: event.constructor.name,
          data: serialize(event),
        });
      });
    },
  });

  deps.eventsBus.subscribe('NewUserRegisteredIntegrationEvent', {
    handle: async (event) => {
      await deps.sqlConnectionFactory.withTransaction(async (client) => {
        const exists = await inboxAccessor.exists(client, event.id);
        if (exists) return;
        await inboxAccessor.add(client, {
          id: event.id,
          occurredOn: event.occurredOn,
          type: event.constructor.name,
          data: serialize(event),
        });
      });
    },
  });

  if (deps.backgroundProcessor) {
    deps.backgroundProcessor.start([
      { name: 'administration-outbox', intervalMs: 2000, work: () => outboxProcessor.process() },
      { name: 'administration-inbox', intervalMs: 2000, work: () => inboxProcessor.process() },
      {
        name: 'administration-internal-commands',
        intervalMs: 2000,
        work: () => internalCommandsProcessor.process(),
      },
    ]);
  }

  return new AdministrationModuleFacade(mediator);
}
