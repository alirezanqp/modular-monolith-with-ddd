import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
const root = '/home/alirezanqp/Documents/modular-ddd';
function write(rel, content) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  console.log(rel);
}
const tc = (out) => `{\n  "extends": "../../../tsconfig.json",\n  "compilerOptions": {\n    "outDir": "../../../dist/${out}",\n    "declaration": true\n  },\n  "include": ["src/**/*"],\n  "exclude": ["node_modules", "dist", "**/*spec.ts"]\n}\n`;

// ===================== ADMINISTRATION =====================
write('src/modules/administration/tsconfig.lib.json', tc('src/modules/administration'));

write('src/modules/administration/src/domain/members/member-id.ts', `import { TypedIdValueBase } from '@building-blocks/domain';
export class MemberId extends TypedIdValueBase { constructor(value?: string) { super(value); } }
`);

write('src/modules/administration/src/domain/members/member.ts', `import { AggregateRoot } from '@building-blocks/domain';
import { MemberId } from './member-id';
export class Member extends AggregateRoot {
  private constructor(
    readonly id: MemberId,
    private readonly login: string,
    private readonly email: string,
    private readonly firstName: string,
    private readonly lastName: string,
    private readonly name: string,
  ) { super(); }
  static create(id: MemberId, login: string, email: string, firstName: string, lastName: string): Member {
    return new Member(id, login, email, firstName, lastName, \`\${firstName} \${lastName}\`);
  }
  static restore(p: { id: string; login: string; email: string; firstName: string; lastName: string; name: string }) {
    return new Member(new MemberId(p.id), p.login, p.email, p.firstName, p.lastName, p.name);
  }
  getLogin() { return this.login; }
  getEmail() { return this.email; }
  getFirstName() { return this.firstName; }
  getLastName() { return this.lastName; }
  getName() { return this.name; }
}
`);

write('src/modules/administration/src/domain/meeting-group-proposals/meeting-group-proposal-id.ts', `import { TypedIdValueBase } from '@building-blocks/domain';
export class MeetingGroupProposalId extends TypedIdValueBase { constructor(value?: string) { super(value); } }
`);

write('src/modules/administration/src/domain/meeting-group-proposals/meeting-group-proposal-status.ts', `export class MeetingGroupProposalStatus {
  static readonly InVerification = 'InVerification';
  static readonly Accepted = 'Accepted';
  static readonly Rejected = 'Rejected';
}
`);

write('src/modules/administration/src/domain/meeting-group-proposals/events/meeting-group-proposal-accepted.domain-event.ts', `import { DomainEventBase } from '@building-blocks/domain';
export class MeetingGroupProposalAcceptedDomainEvent extends DomainEventBase {
  constructor(
    readonly meetingGroupProposalId: string,
    readonly name: string,
    readonly description: string,
    readonly locationCity: string,
    readonly locationCountryCode: string,
    readonly proposalUserId: string,
  ) { super(); }
}
`);

write('src/modules/administration/src/domain/meeting-group-proposals/rules/meeting-group-proposal-can-be-verified-once.rule.ts', `import { IBusinessRule } from '@building-blocks/domain';
import { MeetingGroupProposalStatus } from '../meeting-group-proposal-status';
export class MeetingGroupProposalCanBeVerifiedOnceRule implements IBusinessRule {
  constructor(private readonly status: string) {}
  isBroken() { return this.status !== MeetingGroupProposalStatus.InVerification; }
  get message() { return 'Meeting group proposal can be verified only once'; }
}
`);

write('src/modules/administration/src/domain/meeting-group-proposals/meeting-group-proposal.ts', `import { AggregateRoot } from '@building-blocks/domain';
import { MeetingGroupProposalAcceptedDomainEvent } from './events/meeting-group-proposal-accepted.domain-event';
import { MeetingGroupProposalId } from './meeting-group-proposal-id';
import { MeetingGroupProposalStatus } from './meeting-group-proposal-status';
import { MeetingGroupProposalCanBeVerifiedOnceRule } from './rules/meeting-group-proposal-can-be-verified-once.rule';

export class MeetingGroupProposal extends AggregateRoot {
  private constructor(
    readonly id: MeetingGroupProposalId,
    private readonly name: string,
    private readonly description: string,
    private readonly locationCity: string,
    private readonly locationCountryCode: string,
    private readonly proposalUserId: string,
    private readonly proposalDate: Date,
    private statusCode: string,
    private decisionDate: Date | null,
    private decisionUserId: string | null,
    private decisionCode: string | null,
    private decisionRejectReason: string | null,
  ) { super(); }

  static createToVerify(
    id: MeetingGroupProposalId,
    name: string,
    description: string,
    locationCity: string,
    locationCountryCode: string,
    proposalUserId: string,
  ) {
    return new MeetingGroupProposal(
      id, name, description, locationCity, locationCountryCode, proposalUserId,
      new Date(), MeetingGroupProposalStatus.InVerification, null, null, null, null,
    );
  }

  static restore(p: any) {
    return new MeetingGroupProposal(
      new MeetingGroupProposalId(p.id), p.name, p.description, p.locationCity, p.locationCountryCode,
      p.proposalUserId, p.proposalDate, p.statusCode, p.decisionDate, p.decisionUserId, p.decisionCode, p.decisionRejectReason,
    );
  }

  accept(decisionUserId: string) {
    this.checkRule(new MeetingGroupProposalCanBeVerifiedOnceRule(this.statusCode));
    this.statusCode = MeetingGroupProposalStatus.Accepted;
    this.decisionDate = new Date();
    this.decisionUserId = decisionUserId;
    this.decisionCode = 'Accept';
    this.addDomainEvent(new MeetingGroupProposalAcceptedDomainEvent(
      this.id.value, this.name, this.description, this.locationCity, this.locationCountryCode, this.proposalUserId,
    ));
  }

  reject(decisionUserId: string, reason: string) {
    this.checkRule(new MeetingGroupProposalCanBeVerifiedOnceRule(this.statusCode));
    this.statusCode = MeetingGroupProposalStatus.Rejected;
    this.decisionDate = new Date();
    this.decisionUserId = decisionUserId;
    this.decisionCode = 'Reject';
    this.decisionRejectReason = reason;
  }

  getName() { return this.name; }
  getDescription() { return this.description; }
  getLocationCity() { return this.locationCity; }
  getLocationCountryCode() { return this.locationCountryCode; }
  getProposalUserId() { return this.proposalUserId; }
  getProposalDate() { return this.proposalDate; }
  getStatusCode() { return this.statusCode; }
  getDecisionDate() { return this.decisionDate; }
  getDecisionUserId() { return this.decisionUserId; }
  getDecisionCode() { return this.decisionCode; }
  getDecisionRejectReason() { return this.decisionRejectReason; }
}
`);

write('src/modules/administration/src/integration-events/meeting-group-proposal-accepted.integration-event.ts', `import { IntegrationEvent } from '@building-blocks/infrastructure';
export class MeetingGroupProposalAcceptedIntegrationEvent extends IntegrationEvent {
  constructor(
    readonly meetingGroupProposalId: string,
    readonly name: string,
    readonly description: string,
    readonly locationCity: string,
    readonly locationCountryCode: string,
    readonly proposalUserId: string,
    id?: string,
    occurredOn?: Date,
  ) { super(id, occurredOn); }
}
`);

write('src/modules/administration/src/application/contracts/administration.module.ts', `import { ICommand, ICommandWithResult, IQuery } from '@building-blocks/application';
export interface IAdministrationModule {
  executeCommand(command: ICommand): Promise<void>;
  executeCommand<TResult>(command: ICommandWithResult<TResult>): Promise<TResult>;
  executeQuery<TResult>(query: IQuery<TResult>): Promise<TResult>;
}
`);

write('src/modules/administration/src/application/members/create-member.command.ts', `import { InternalCommandBase } from '@building-blocks/application';
export class CreateMemberCommand extends InternalCommandBase {
  constructor(id: string, readonly memberId: string, readonly login: string, readonly email: string, readonly firstName: string, readonly lastName: string) { super(id); }
  static fromJson(d: Record<string, unknown>) {
    return new CreateMemberCommand(String(d.id), String(d.memberId), String(d.login), String(d.email), String(d.firstName), String(d.lastName));
  }
}
`);

write('src/modules/administration/src/application/members/create-member.command-handler.ts', `import { ICommandHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { CreateMemberCommand } from './create-member.command';
export class CreateMemberCommandHandler implements ICommandHandler<CreateMemberCommand> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(command: CreateMemberCommand): Promise<void> {
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        \`INSERT INTO administration.members (id, login, email, first_name, last_name, name)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING\`,
        [command.memberId, command.login, command.email, command.firstName, command.lastName, \`\${command.firstName} \${command.lastName}\`],
      );
    } finally { releaseIfNotInTransaction(client); }
  }
}
`);

write('src/modules/administration/src/application/meeting-group-proposals/request-meeting-group-proposal-verification.command.ts', `import { InternalCommandBase } from '@building-blocks/application';
export class RequestMeetingGroupProposalVerificationCommand extends InternalCommandBase {
  constructor(
    id: string,
    readonly meetingGroupProposalId: string,
    readonly name: string,
    readonly description: string,
    readonly locationCity: string,
    readonly locationCountryCode: string,
    readonly proposalUserId: string,
  ) { super(id); }
  static fromJson(d: Record<string, unknown>) {
    return new RequestMeetingGroupProposalVerificationCommand(
      String(d.id), String(d.meetingGroupProposalId), String(d.name), String(d.description),
      String(d.locationCity), String(d.locationCountryCode), String(d.proposalUserId),
    );
  }
}
`);

write('src/modules/administration/src/application/meeting-group-proposals/request-meeting-group-proposal-verification.command-handler.ts', `import { ICommandHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { UnitOfWork, releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { MeetingGroupProposal } from '../../domain/meeting-group-proposals/meeting-group-proposal';
import { MeetingGroupProposalId } from '../../domain/meeting-group-proposals/meeting-group-proposal-id';
import { RequestMeetingGroupProposalVerificationCommand } from './request-meeting-group-proposal-verification.command';
export class RequestMeetingGroupProposalVerificationCommandHandler implements ICommandHandler<RequestMeetingGroupProposalVerificationCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly unitOfWork: UnitOfWork) {}
  async handle(command: RequestMeetingGroupProposalVerificationCommand): Promise<void> {
    const proposal = MeetingGroupProposal.createToVerify(
      new MeetingGroupProposalId(command.meetingGroupProposalId),
      command.name, command.description, command.locationCity, command.locationCountryCode, command.proposalUserId,
    );
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        \`INSERT INTO administration.meeting_group_proposals
         (id, name, description, location_city, location_country_code, proposal_user_id, proposal_date, status_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING\`,
        [proposal.id.value, proposal.getName(), proposal.getDescription(), proposal.getLocationCity(),
         proposal.getLocationCountryCode(), proposal.getProposalUserId(), proposal.getProposalDate(), proposal.getStatusCode()],
      );
    } finally { releaseIfNotInTransaction(client); }
    this.unitOfWork.trackAggregate(proposal);
  }
}
`);

write('src/modules/administration/src/application/meeting-group-proposals/accept-meeting-group-proposal.command.ts', `import { CommandBase } from '@building-blocks/application';
export class AcceptMeetingGroupProposalCommand extends CommandBase {
  constructor(readonly meetingGroupProposalId: string, readonly decisionUserId: string) { super(); }
}
`);

write('src/modules/administration/src/application/meeting-group-proposals/accept-meeting-group-proposal.command-handler.ts', `import { ICommandHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { UnitOfWork, releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { MeetingGroupProposal } from '../../domain/meeting-group-proposals/meeting-group-proposal';
import { AcceptMeetingGroupProposalCommand } from './accept-meeting-group-proposal.command';
export class AcceptMeetingGroupProposalCommandHandler implements ICommandHandler<AcceptMeetingGroupProposalCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly unitOfWork: UnitOfWork) {}
  async handle(command: AcceptMeetingGroupProposalCommand): Promise<void> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(\`SELECT * FROM administration.meeting_group_proposals WHERE id = $1\`, [command.meetingGroupProposalId]);
      const row = result.rows[0];
      if (!row) throw new Error('Proposal not found');
      const proposal = MeetingGroupProposal.restore({
        id: row.id, name: row.name, description: row.description, locationCity: row.location_city,
        locationCountryCode: row.location_country_code, proposalUserId: row.proposal_user_id,
        proposalDate: row.proposal_date, statusCode: row.status_code, decisionDate: row.decision_date,
        decisionUserId: row.decision_user_id, decisionCode: row.decision_code, decisionRejectReason: row.decision_reject_reason,
      });
      proposal.accept(command.decisionUserId);
      await client.query(
        \`UPDATE administration.meeting_group_proposals
         SET status_code=$2, decision_date=$3, decision_user_id=$4, decision_code=$5 WHERE id=$1\`,
        [proposal.id.value, proposal.getStatusCode(), proposal.getDecisionDate(), proposal.getDecisionUserId(), proposal.getDecisionCode()],
      );
      this.unitOfWork.trackAggregate(proposal);
    } finally { releaseIfNotInTransaction(client); }
  }
}
`);

write('src/modules/administration/src/application/meeting-group-proposals/get-meeting-group-proposals.query.ts', `import { QueryBase } from '@building-blocks/application';
export interface MeetingGroupProposalDto {
  id: string; name: string; description: string; locationCity: string; locationCountryCode: string;
  proposalUserId: string; proposalDate: Date; statusCode: string;
}
export class GetMeetingGroupProposalsQuery extends QueryBase<MeetingGroupProposalDto[]> {}
export class GetMeetingGroupProposalQuery extends QueryBase<MeetingGroupProposalDto | null> {
  constructor(readonly meetingGroupProposalId: string) { super(); }
}
`);

write('src/modules/administration/src/application/meeting-group-proposals/get-meeting-group-proposals.query-handler.ts', `import { IQueryHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { GetMeetingGroupProposalQuery, GetMeetingGroupProposalsQuery, MeetingGroupProposalDto } from './get-meeting-group-proposals.query';
export class GetMeetingGroupProposalsQueryHandler implements IQueryHandler<GetMeetingGroupProposalsQuery, MeetingGroupProposalDto[]> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(): Promise<MeetingGroupProposalDto[]> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(\`SELECT id, name, description, "locationCity", "locationCountryCode", "proposalUserId", "proposalDate", "statusCode" FROM administration.v_meeting_group_proposals\`);
      return result.rows as MeetingGroupProposalDto[];
    } finally { releaseIfNotInTransaction(client); }
  }
}
export class GetMeetingGroupProposalQueryHandler implements IQueryHandler<GetMeetingGroupProposalQuery, MeetingGroupProposalDto | null> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(query: GetMeetingGroupProposalQuery): Promise<MeetingGroupProposalDto | null> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(\`SELECT id, name, description, "locationCity", "locationCountryCode", "proposalUserId", "proposalDate", "statusCode" FROM administration.v_meeting_group_proposals WHERE id = $1\`, [query.meetingGroupProposalId]);
      return (result.rows[0] as MeetingGroupProposalDto) ?? null;
    } finally { releaseIfNotInTransaction(client); }
  }
}
`);

write('src/modules/administration/src/infrastructure/administration.module-bootstrap.ts', `import { ExecutionContextAccessor, HandlerRegistry, IExecutionContextAccessor, Mediator } from '@building-blocks/application';
import { BackgroundProcessor, createCommandFactory, createTypedEventFactory, DomainEventsDispatcher, InMemoryEventsBus, InboxAccessor, InboxProcessor, InternalCommandsAccessor, InternalCommandsProcessor, OutboxAccessor, OutboxProcessor, SqlConnectionFactory, UnitOfWork } from '@building-blocks/infrastructure';
import { NewUserRegisteredIntegrationEvent } from '@modules/registrations';
import { randomUUID } from 'crypto';
import { IAdministrationModule } from '../application/contracts/administration.module';
import { AcceptMeetingGroupProposalCommand } from '../application/meeting-group-proposals/accept-meeting-group-proposal.command';
import { AcceptMeetingGroupProposalCommandHandler } from '../application/meeting-group-proposals/accept-meeting-group-proposal.command-handler';
import { GetMeetingGroupProposalQuery, GetMeetingGroupProposalsQuery } from '../application/meeting-group-proposals/get-meeting-group-proposals.query';
import { GetMeetingGroupProposalQueryHandler, GetMeetingGroupProposalsQueryHandler } from '../application/meeting-group-proposals/get-meeting-group-proposals.query-handler';
import { RequestMeetingGroupProposalVerificationCommand } from '../application/meeting-group-proposals/request-meeting-group-proposal-verification.command';
import { RequestMeetingGroupProposalVerificationCommandHandler } from '../application/meeting-group-proposals/request-meeting-group-proposal-verification.command-handler';
import { CreateMemberCommand } from '../application/members/create-member.command';
import { CreateMemberCommandHandler } from '../application/members/create-member.command-handler';
import { MeetingGroupProposalAcceptedDomainEvent } from '../domain/meeting-group-proposals/events/meeting-group-proposal-accepted.domain-event';
import { MeetingGroupProposalAcceptedIntegrationEvent } from '../integration-events/meeting-group-proposal-accepted.integration-event';

export class AdministrationModuleFacade implements IAdministrationModule {
  constructor(private readonly mediator: Mediator) {}
  executeCommand(command: never): Promise<void>;
  executeCommand<TResult>(command: never): Promise<TResult>;
  executeCommand(command: never) { return this.mediator.send(command); }
  executeQuery<TResult>(query: never) { return this.mediator.query(query) as Promise<TResult>; }
}

export function bootstrapAdministrationModule(options: { connectionString: string; eventsBus: InMemoryEventsBus; executionContextAccessor?: IExecutionContextAccessor }) {
  const sql = new SqlConnectionFactory(options.connectionString);
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
`);

write('src/modules/administration/src/index.ts', `export * from './application/contracts/administration.module';
export * from './application/meeting-group-proposals/accept-meeting-group-proposal.command';
export * from './application/meeting-group-proposals/get-meeting-group-proposals.query';
export * from './integration-events/meeting-group-proposal-accepted.integration-event';
export * from './infrastructure/administration.module-bootstrap';
`);

console.log('administration done');
