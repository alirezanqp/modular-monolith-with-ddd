import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const root = '/home/alirezanqp/Documents/modular-ddd';

function write(rel, content) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  console.log('wrote', rel);
}

const tsconfig = (out) => `{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/${out}",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*spec.ts"]
}
`;

// ========== REGISTRATIONS ==========
write('src/modules/registrations/tsconfig.lib.json', tsconfig('src/modules/registrations'));

write(
  'src/modules/registrations/src/integration-events/new-user-registered.integration-event.ts',
  `import { IntegrationEvent } from '@building-blocks/infrastructure';

export class NewUserRegisteredIntegrationEvent extends IntegrationEvent {
  constructor(
    readonly userRegistrationId: string,
    readonly login: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly name: string,
    readonly password: string,
    id?: string,
    occurredOn?: Date,
  ) {
    super(id, occurredOn);
  }
}
`,
);

write(
  'src/modules/registrations/src/domain/user-registrations/user-registration-id.ts',
  `import { TypedIdValueBase } from '@building-blocks/domain';

export class UserRegistrationId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }
}
`,
);

write(
  'src/modules/registrations/src/domain/user-registrations/user-registration-status.ts',
  `export class UserRegistrationStatus {
  static readonly WaitingForConfirmation = 'WaitingForConfirmation';
  static readonly Confirmed = 'Confirmed';
  static readonly Expired = 'Expired';
}
`,
);

write(
  'src/modules/registrations/src/domain/user-registrations/rules/user-registration-cannot-be-confirmed-more-than-once.rule.ts',
  `import { IBusinessRule } from '@building-blocks/domain';
import { UserRegistrationStatus } from '../user-registration-status';

export class UserRegistrationCannotBeConfirmedMoreThanOnceRule implements IBusinessRule {
  constructor(private readonly status: string) {}
  isBroken(): boolean {
    return this.status === UserRegistrationStatus.Confirmed;
  }
  get message(): string {
    return 'User Registration cannot be confirmed more than once';
  }
}
`,
);

write(
  'src/modules/registrations/src/domain/user-registrations/events/new-user-registered.domain-event.ts',
  `import { DomainEventBase } from '@building-blocks/domain';

export class NewUserRegisteredDomainEvent extends DomainEventBase {
  constructor(
    readonly userRegistrationId: string,
    readonly login: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly name: string,
    readonly password: string,
  ) {
    super();
  }
}
`,
);

write(
  'src/modules/registrations/src/domain/user-registrations/events/user-registration-confirmed.domain-event.ts',
  `import { DomainEventBase } from '@building-blocks/domain';

export class UserRegistrationConfirmedDomainEvent extends DomainEventBase {
  constructor(readonly userRegistrationId: string) {
    super();
  }
}
`,
);

write(
  'src/modules/registrations/src/domain/user-registrations/user-registration.ts',
  `import { AggregateRoot } from '@building-blocks/domain';
import { NewUserRegisteredDomainEvent } from './events/new-user-registered.domain-event';
import { UserRegistrationConfirmedDomainEvent } from './events/user-registration-confirmed.domain-event';
import { UserRegistrationCannotBeConfirmedMoreThanOnceRule } from './rules/user-registration-cannot-be-confirmed-more-than-once.rule';
import { UserRegistrationId } from './user-registration-id';
import { UserRegistrationStatus } from './user-registration-status';

export class UserRegistration extends AggregateRoot {
  private constructor(
    readonly id: UserRegistrationId,
    private readonly login: string,
    private readonly password: string,
    private readonly email: string,
    private readonly firstName: string,
    private readonly lastName: string,
    private readonly name: string,
    private statusCode: string,
    private readonly registerDate: Date,
    private confirmedDate: Date | null,
  ) {
    super();
  }

  static registerNewUser(
    id: UserRegistrationId,
    login: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ): UserRegistration {
    const name = \`\${firstName} \${lastName}\`;
    const registration = new UserRegistration(
      id,
      login,
      password,
      email,
      firstName,
      lastName,
      name,
      UserRegistrationStatus.WaitingForConfirmation,
      new Date(),
      null,
    );
    registration.addDomainEvent(
      new NewUserRegisteredDomainEvent(
        id.value,
        login,
        email,
        firstName,
        lastName,
        name,
        password,
      ),
    );
    return registration;
  }

  static restore(props: {
    id: string;
    login: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    statusCode: string;
    registerDate: Date;
    confirmedDate: Date | null;
  }): UserRegistration {
    return new UserRegistration(
      new UserRegistrationId(props.id),
      props.login,
      props.password,
      props.email,
      props.firstName,
      props.lastName,
      props.name,
      props.statusCode,
      props.registerDate,
      props.confirmedDate,
    );
  }

  confirm(): void {
    this.checkRule(new UserRegistrationCannotBeConfirmedMoreThanOnceRule(this.statusCode));
    this.statusCode = UserRegistrationStatus.Confirmed;
    this.confirmedDate = new Date();
    this.addDomainEvent(new UserRegistrationConfirmedDomainEvent(this.id.value));
  }

  getLogin() { return this.login; }
  getPassword() { return this.password; }
  getEmail() { return this.email; }
  getFirstName() { return this.firstName; }
  getLastName() { return this.lastName; }
  getName() { return this.name; }
  getStatusCode() { return this.statusCode; }
  getRegisterDate() { return this.registerDate; }
  getConfirmedDate() { return this.confirmedDate; }
}
`,
);

write(
  'src/modules/registrations/src/application/contracts/registrations.module.ts',
  `import { ICommand, ICommandWithResult, IQuery } from '@building-blocks/application';

export interface IRegistrationsModule {
  executeCommand(command: ICommand): Promise<void>;
  executeCommand<TResult>(command: ICommandWithResult<TResult>): Promise<TResult>;
  executeQuery<TResult>(query: IQuery<TResult>): Promise<TResult>;
}
`,
);

write(
  'src/modules/registrations/src/application/user-registrations/user-registration.repository.ts',
  `import { UserRegistration } from '../../domain/user-registrations/user-registration';
import { UserRegistrationId } from '../../domain/user-registrations/user-registration-id';

export interface IUserRegistrationRepository {
  add(registration: UserRegistration): Promise<void>;
  getById(id: UserRegistrationId): Promise<UserRegistration>;
  update(registration: UserRegistration): Promise<void>;
}
`,
);

write(
  'src/modules/registrations/src/application/user-registrations/register-new-user.command.ts',
  `import { CommandBaseWithResult } from '@building-blocks/application';

export class RegisterNewUserCommand extends CommandBaseWithResult<string> {
  constructor(
    readonly login: string,
    readonly password: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
  ) {
    super();
  }
}
`,
);

write(
  'src/modules/registrations/src/application/user-registrations/register-new-user.command-handler.ts',
  `import { ICommandHandlerWithResult } from '@building-blocks/application';
import { UnitOfWork } from '@building-blocks/infrastructure';
import * as bcrypt from 'bcrypt';
import { UserRegistration } from '../../domain/user-registrations/user-registration';
import { UserRegistrationId } from '../../domain/user-registrations/user-registration-id';
import { RegisterNewUserCommand } from './register-new-user.command';
import { IUserRegistrationRepository } from './user-registration.repository';

export class RegisterNewUserCommandHandler
  implements ICommandHandlerWithResult<RegisterNewUserCommand, string>
{
  constructor(
    private readonly repository: IUserRegistrationRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async handle(command: RegisterNewUserCommand): Promise<string> {
    const passwordHash = await bcrypt.hash(command.password, 10);
    const id = new UserRegistrationId();
    const registration = UserRegistration.registerNewUser(
      id,
      command.login,
      passwordHash,
      command.email,
      command.firstName,
      command.lastName,
    );
    await this.repository.add(registration);
    this.unitOfWork.trackAggregate(registration);
    return id.value;
  }
}
`,
);

write(
  'src/modules/registrations/src/application/user-registrations/confirm-user-registration.command.ts',
  `import { CommandBase } from '@building-blocks/application';

export class ConfirmUserRegistrationCommand extends CommandBase {
  constructor(readonly userRegistrationId: string) {
    super();
  }
}
`,
);

write(
  'src/modules/registrations/src/application/user-registrations/confirm-user-registration.command-handler.ts',
  `import { ICommandHandler } from '@building-blocks/application';
import { UnitOfWork } from '@building-blocks/infrastructure';
import { UserRegistrationId } from '../../domain/user-registrations/user-registration-id';
import { ConfirmUserRegistrationCommand } from './confirm-user-registration.command';
import { IUserRegistrationRepository } from './user-registration.repository';

export class ConfirmUserRegistrationCommandHandler
  implements ICommandHandler<ConfirmUserRegistrationCommand>
{
  constructor(
    private readonly repository: IUserRegistrationRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async handle(command: ConfirmUserRegistrationCommand): Promise<void> {
    const registration = await this.repository.getById(
      new UserRegistrationId(command.userRegistrationId),
    );
    registration.confirm();
    await this.repository.update(registration);
    this.unitOfWork.trackAggregate(registration);
  }
}
`,
);

write(
  'src/modules/registrations/src/application/user-registrations/get-user-registration.query.ts',
  `import { QueryBase } from '@building-blocks/application';

export interface UserRegistrationDto {
  id: string;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  statusCode: string;
  registerDate: Date;
  confirmedDate: Date | null;
}

export class GetUserRegistrationQuery extends QueryBase<UserRegistrationDto | null> {
  constructor(readonly userRegistrationId: string) {
    super();
  }
}
`,
);

write(
  'src/modules/registrations/src/application/user-registrations/get-user-registration.query-handler.ts',
  `import { IQueryHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { GetUserRegistrationQuery, UserRegistrationDto } from './get-user-registration.query';

export class GetUserRegistrationQueryHandler
  implements IQueryHandler<GetUserRegistrationQuery, UserRegistrationDto | null>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}

  async handle(query: GetUserRegistrationQuery): Promise<UserRegistrationDto | null> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(
        \`SELECT id, login, email, "firstName", "lastName", name, "statusCode", "registerDate", "confirmedDate"
         FROM registrations.v_user_registrations WHERE id = $1\`,
        [query.userRegistrationId],
      );
      return (result.rows[0] as UserRegistrationDto | undefined) ?? null;
    } finally {
      releaseIfNotInTransaction(client);
    }
  }
}
`,
);

write(
  'src/modules/registrations/src/application/user-registrations/send-user-registration-confirmation-email.command.ts',
  `import { InternalCommandBase } from '@building-blocks/application';

export class SendUserRegistrationConfirmationEmailCommand extends InternalCommandBase {
  constructor(
    id: string,
    readonly userRegistrationId: string,
    readonly email: string,
  ) {
    super(id);
  }

  static fromJson(data: Record<string, unknown>): SendUserRegistrationConfirmationEmailCommand {
    return new SendUserRegistrationConfirmationEmailCommand(
      String(data.id),
      String(data.userRegistrationId),
      String(data.email),
    );
  }
}
`,
);

write(
  'src/modules/registrations/src/application/user-registrations/send-user-registration-confirmation-email.command-handler.ts',
  `import { ICommandHandler, IEmailSender } from '@building-blocks/application';
import { SendUserRegistrationConfirmationEmailCommand } from './send-user-registration-confirmation-email.command';

export class SendUserRegistrationConfirmationEmailCommandHandler
  implements ICommandHandler<SendUserRegistrationConfirmationEmailCommand>
{
  constructor(private readonly emailSender: IEmailSender) {}

  async handle(command: SendUserRegistrationConfirmationEmailCommand): Promise<void> {
    await this.emailSender.sendEmail({
      from: 'noreply@mymeetings.com',
      to: command.email,
      subject: 'MyMeetings registration confirmation',
      content: \`Please confirm registration \${command.userRegistrationId}\`,
    });
  }
}
`,
);

write(
  'src/modules/registrations/src/infrastructure/domain/user-registration.repository.ts',
  `import { ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { IUserRegistrationRepository } from '../../application/user-registrations/user-registration.repository';
import { UserRegistration } from '../../domain/user-registrations/user-registration';
import { UserRegistrationId } from '../../domain/user-registrations/user-registration-id';

export class UserRegistrationRepository implements IUserRegistrationRepository {
  constructor(private readonly sql: ISqlConnectionFactory) {}

  async add(registration: UserRegistration): Promise<void> {
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        \`INSERT INTO registrations.user_registrations
         (id, login, email, password, first_name, last_name, name, status_code, register_date, confirmed_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)\`,
        [
          registration.id.value,
          registration.getLogin(),
          registration.getEmail(),
          registration.getPassword(),
          registration.getFirstName(),
          registration.getLastName(),
          registration.getName(),
          registration.getStatusCode(),
          registration.getRegisterDate(),
          registration.getConfirmedDate(),
        ],
      );
    } finally {
      releaseIfNotInTransaction(client);
    }
  }

  async getById(id: UserRegistrationId): Promise<UserRegistration> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(
        \`SELECT id, login, email, password, first_name, last_name, name, status_code, register_date, confirmed_date
         FROM registrations.user_registrations WHERE id = $1\`,
        [id.value],
      );
      const row = result.rows[0];
      if (!row) {
        throw new Error(\`User registration \${id.value} not found\`);
      }
      return UserRegistration.restore({
        id: row.id,
        login: row.login,
        email: row.email,
        password: row.password,
        firstName: row.first_name,
        lastName: row.last_name,
        name: row.name,
        statusCode: row.status_code,
        registerDate: row.register_date,
        confirmedDate: row.confirmed_date,
      });
    } finally {
      releaseIfNotInTransaction(client);
    }
  }

  async update(registration: UserRegistration): Promise<void> {
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        \`UPDATE registrations.user_registrations
         SET status_code = $2, confirmed_date = $3
         WHERE id = $1\`,
        [registration.id.value, registration.getStatusCode(), registration.getConfirmedDate()],
      );
    } finally {
      releaseIfNotInTransaction(client);
    }
  }
}
`,
);

write(
  'src/modules/registrations/src/infrastructure/registrations.module-bootstrap.ts',
  `import {
  ExecutionContextAccessor,
  HandlerRegistry,
  IExecutionContextAccessor,
  Mediator,
} from '@building-blocks/application';
import {
  BackgroundProcessor,
  createCommandFactory,
  createTypedEventFactory,
  DomainEventsDispatcher,
  EmailSender,
  InMemoryEventsBus,
  InboxAccessor,
  InboxProcessor,
  InternalCommandsAccessor,
  InternalCommandsProcessor,
  OutboxAccessor,
  OutboxProcessor,
  SqlConnectionFactory,
  UnitOfWork,
} from '@building-blocks/infrastructure';
import { randomUUID } from 'crypto';
import { IRegistrationsModule } from '../application/contracts/registrations.module';
import { ConfirmUserRegistrationCommand } from '../application/user-registrations/confirm-user-registration.command';
import { ConfirmUserRegistrationCommandHandler } from '../application/user-registrations/confirm-user-registration.command-handler';
import { GetUserRegistrationQuery } from '../application/user-registrations/get-user-registration.query';
import { GetUserRegistrationQueryHandler } from '../application/user-registrations/get-user-registration.query-handler';
import { RegisterNewUserCommand } from '../application/user-registrations/register-new-user.command';
import { RegisterNewUserCommandHandler } from '../application/user-registrations/register-new-user.command-handler';
import { SendUserRegistrationConfirmationEmailCommand } from '../application/user-registrations/send-user-registration-confirmation-email.command';
import { SendUserRegistrationConfirmationEmailCommandHandler } from '../application/user-registrations/send-user-registration-confirmation-email.command-handler';
import { NewUserRegisteredDomainEvent } from '../domain/user-registrations/events/new-user-registered.domain-event';
import { UserRegistrationConfirmedDomainEvent } from '../domain/user-registrations/events/user-registration-confirmed.domain-event';
import { NewUserRegisteredIntegrationEvent } from '../integration-events/new-user-registered.integration-event';
import { UserRegistrationRepository } from './domain/user-registration.repository';

export class RegistrationsModuleFacade implements IRegistrationsModule {
  constructor(private readonly mediator: Mediator) {}
  executeCommand(command: never): Promise<void>;
  executeCommand<TResult>(command: never): Promise<TResult>;
  executeCommand(command: never): Promise<unknown> {
    return this.mediator.send(command);
  }
  executeQuery<TResult>(query: never): Promise<TResult> {
    return this.mediator.query(query);
  }
}

export function bootstrapRegistrationsModule(options: {
  connectionString: string;
  eventsBus: InMemoryEventsBus;
  executionContextAccessor?: IExecutionContextAccessor;
}) {
  const sql = new SqlConnectionFactory(options.connectionString);
  const schema = 'registrations';
  const outbox = new OutboxAccessor(schema);
  const inbox = new InboxAccessor(schema);
  const internalCommands = new InternalCommandsAccessor(schema);
  const domainEvents = new DomainEventsDispatcher();
  const unitOfWork = new UnitOfWork(sql, domainEvents, outbox, schema);
  const registry = new HandlerRegistry();
  const executionContext =
    options.executionContextAccessor ?? new ExecutionContextAccessor(null, 'registrations');
  const mediator = new Mediator(registry, executionContext, unitOfWork, (work) =>
    sql.withTransaction(async () => work()),
  );
  const repository = new UserRegistrationRepository(sql);
  const emailSender = new EmailSender(sql);

  registry.registerCommandHandlerWithResult(
    RegisterNewUserCommand,
    new RegisterNewUserCommandHandler(repository, unitOfWork),
  );
  registry.registerCommandHandler(
    ConfirmUserRegistrationCommand,
    new ConfirmUserRegistrationCommandHandler(repository, unitOfWork),
  );
  registry.registerCommandHandler(
    SendUserRegistrationConfirmationEmailCommand,
    new SendUserRegistrationConfirmationEmailCommandHandler(emailSender),
  );
  registry.registerQueryHandler(
    GetUserRegistrationQuery,
    new GetUserRegistrationQueryHandler(sql),
  );

  domainEvents.register(NewUserRegisteredDomainEvent.name, {
    async handle(domainEvent: NewUserRegisteredDomainEvent) {
      await sql.withTransaction(async (client) => {
        await internalCommands.add(client, {
          id: randomUUID(),
          type: SendUserRegistrationConfirmationEmailCommand.name,
          data: {
            id: randomUUID(),
            userRegistrationId: domainEvent.userRegistrationId,
            email: domainEvent.email,
          },
        });
      });
    },
  });

  domainEvents.register(UserRegistrationConfirmedDomainEvent.name, {
    async handle(domainEvent: UserRegistrationConfirmedDomainEvent) {
      const registration = await repository.getById(
        // lazy import id
        new (await import('../domain/user-registrations/user-registration-id')).UserRegistrationId(
          domainEvent.userRegistrationId,
        ),
      );
      unitOfWork.enqueueIntegrationEvent(
        new NewUserRegisteredIntegrationEvent(
          registration.id.value,
          registration.getLogin(),
          registration.getEmail(),
          registration.getFirstName(),
          registration.getLastName(),
          registration.getName(),
          registration.getPassword(),
        ),
      );
    },
  });

  const outboxProcessor = new OutboxProcessor(
    sql,
    outbox,
    options.eventsBus,
    createTypedEventFactory({
      [NewUserRegisteredIntegrationEvent.name]: NewUserRegisteredIntegrationEvent,
    }),
  );
  const inboxProcessor = new InboxProcessor(sql, inbox, internalCommands, () => null);
  const internalProcessor = new InternalCommandsProcessor(
    sql,
    internalCommands,
    mediator,
    createCommandFactory({
      [SendUserRegistrationConfirmationEmailCommand.name]:
        SendUserRegistrationConfirmationEmailCommand,
    }),
  );

  const background = new BackgroundProcessor();
  background.start([
    { name: 'registrations-outbox', intervalMs: 2000, work: () => outboxProcessor.process() },
    { name: 'registrations-inbox', intervalMs: 2000, work: () => inboxProcessor.process() },
    { name: 'registrations-internal', intervalMs: 2000, work: () => internalProcessor.process() },
  ]);

  return {
    facade: new RegistrationsModuleFacade(mediator) as IRegistrationsModule,
    stop: () => background.stop(),
  };
}
`,
);

write(
  'src/modules/registrations/src/index.ts',
  `export * from './application/contracts/registrations.module';
export * from './application/user-registrations/register-new-user.command';
export * from './application/user-registrations/confirm-user-registration.command';
export * from './application/user-registrations/get-user-registration.query';
export * from './integration-events/new-user-registered.integration-event';
export * from './infrastructure/registrations.module-bootstrap';
`,
);

console.log('registrations done');
