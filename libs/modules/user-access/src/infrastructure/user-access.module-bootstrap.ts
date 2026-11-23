import {
  ExecutionContextAccessor,
  HandlerRegistry,
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
  InMemoryEventsBus,
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
import { NewUserRegisteredIntegrationEvent } from '@modules/registrations';
import { randomUUID } from 'crypto';
import { AuthenticateCommand } from '../application/authentication/authenticate.command';
import { AuthenticateCommandHandler } from '../application/authentication/authenticate.command-handler';
import {
  GetAuthenticatedUserPermissionsQueryHandler,
  GetUserPermissionsQueryHandler,
} from '../application/authorization/get-user-permissions.query-handler';
import {
  GetAuthenticatedUserPermissionsQuery,
  GetUserPermissionsQuery,
} from '../application/authorization/get-user-permissions.query';
import { IUserAccessModule } from '../application/contracts/user-access.module';
import { CreateUserCommand } from '../application/users/create-user.command';
import { CreateUserCommandHandler } from '../application/users/create-user.command-handler';
import {
  GetAuthenticatedUserQueryHandler,
  GetUserQueryHandler,
} from '../application/users/get-user.query-handler';
import {
  GetAuthenticatedUserQuery,
  GetUserQuery,
} from '../application/users/get-user.query';
import { UserRepository } from './domain/user.repository';

export class UserAccessModuleFacade implements IUserAccessModule {
  constructor(private readonly mediator: Mediator) {}

  executeCommand<TResult>(command: ICommandWithResult<TResult>): Promise<TResult>;
  executeCommand(command: ICommand): Promise<void>;
  executeCommand(command: ICommand): Promise<unknown> {
    return this.mediator.send(command as never);
  }

  executeQuery<TResult>(query: IQuery<TResult>): Promise<TResult> {
    return this.mediator.query(query);
  }
}

export class UserAccessModuleBootstrap {
  private backgroundProcessor: BackgroundProcessor | null = null;
  private facade: IUserAccessModule | null = null;

  start(options: {
    connectionString: string;
    eventsBus: InMemoryEventsBus;
    executionContextAccessor?: IExecutionContextAccessor;
  }): IUserAccessModule {
    if (this.facade) {
      return this.facade;
    }

    const sql = new SqlConnectionFactory(options.connectionString);
    const schema = 'users';
    const outbox = new OutboxAccessor(schema);
    const inbox = new InboxAccessor(schema);
    const internalCommands = new InternalCommandsAccessor(schema);
    const domainEvents = new DomainEventsDispatcher();
    const unitOfWork = new UnitOfWork(sql, domainEvents, outbox, schema);
    const registry = new HandlerRegistry();
    const executionContext =
      options.executionContextAccessor ?? new ExecutionContextAccessor(null, 'user-access');
    const mediator = new Mediator(registry, executionContext, unitOfWork, (work) =>
      sql.withTransaction(async () => work()),
    );

    const userRepository = new UserRepository(sql);
    registry.registerCommandHandlerWithResult(
      AuthenticateCommand,
      new AuthenticateCommandHandler(userRepository),
    );
    registry.registerCommandHandler(
      CreateUserCommand,
      new CreateUserCommandHandler(userRepository, unitOfWork),
    );

    const getUserHandler = new GetUserQueryHandler(sql);
    registry.registerQueryHandler(GetUserQuery, getUserHandler);
    registry.registerQueryHandler(
      GetAuthenticatedUserQuery,
      new GetAuthenticatedUserQueryHandler(getUserHandler),
    );
    registry.registerQueryHandler(
      GetUserPermissionsQuery,
      new GetUserPermissionsQueryHandler(sql),
    );
    registry.registerQueryHandler(
      GetAuthenticatedUserPermissionsQuery,
      new GetAuthenticatedUserPermissionsQueryHandler(sql),
    );

    options.eventsBus.subscribe(NewUserRegisteredIntegrationEvent.name, {
      async handle(event: NewUserRegisteredIntegrationEvent) {
        await sql.withTransaction(async (client) => {
          await inbox.add(client, {
            id: event.id,
            occurredOn: event.occurredOn,
            type: event.constructor.name,
            data: serialize(event),
          });
        });
      },
    });

    const outboxProcessor = new OutboxProcessor(
      sql,
      outbox,
      options.eventsBus,
      createTypedEventFactory({}),
    );
    const inboxProcessor = new InboxProcessor(sql, inbox, internalCommands, (type, data) => {
      if (type === NewUserRegisteredIntegrationEvent.name) {
        return {
          id: randomUUID(),
          type: CreateUserCommand.name,
          data: {
            id: randomUUID(),
            userId: data.userRegistrationId,
            login: data.login,
            password: data.password,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
          },
        };
      }
      return null;
    });
    const internalProcessor = new InternalCommandsProcessor(
      sql,
      internalCommands,
      mediator,
      createCommandFactory({
        [CreateUserCommand.name]: CreateUserCommand,
      }),
    );

    this.backgroundProcessor = new BackgroundProcessor();
    this.backgroundProcessor.start([
      { name: 'users-outbox', intervalMs: 2000, work: () => outboxProcessor.process() },
      { name: 'users-inbox', intervalMs: 2000, work: () => inboxProcessor.process() },
      { name: 'users-internal', intervalMs: 2000, work: () => internalProcessor.process() },
    ]);

    this.facade = new UserAccessModuleFacade(mediator);
    return this.facade;
  }

  stop(): void {
    this.backgroundProcessor?.stop();
    this.backgroundProcessor = null;
  }
}

export function bootstrapUserAccessModule(options: {
  connectionString: string;
  eventsBus: InMemoryEventsBus;
  executionContextAccessor?: IExecutionContextAccessor;
}): { facade: IUserAccessModule; stop: () => void } {
  const bootstrap = new UserAccessModuleBootstrap();
  const facade = bootstrap.start(options);
  return { facade, stop: () => bootstrap.stop() };
}
