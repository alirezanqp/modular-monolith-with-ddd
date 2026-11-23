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
import { UserRegistrationConfirmedDomainEvent } from '../domain/user-registrations/events/user-registration-confirmed.domain-event';
import { UserRegistrationPendingDomainEvent } from '../domain/user-registrations/events/user-registration-pending.domain-event';
import { UserRegistrationId } from '../domain/user-registrations/user-registration-id';
import { NewUserRegisteredIntegrationEvent } from '../integration-events/new-user-registered.integration-event';
import { UserRegistrationRepository } from './domain/user-registration.repository';

export class RegistrationsModuleFacade implements IRegistrationsModule {
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

export class RegistrationsModuleBootstrap {
  private backgroundProcessor: BackgroundProcessor | null = null;
  private facade: IRegistrationsModule | null = null;

  start(options: {
    connectionString: string;
    eventsBus: InMemoryEventsBus;
    executionContextAccessor?: IExecutionContextAccessor;
  }): IRegistrationsModule {
    if (this.facade) {
      return this.facade;
    }

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

    domainEvents.register(UserRegistrationPendingDomainEvent.name, {
      async handle(domainEvent: UserRegistrationPendingDomainEvent) {
        await sql.withTransaction(async (client) => {
          await internalCommands.add(client, {
            id: randomUUID(),
            type: SendUserRegistrationConfirmationEmailCommand.name,
            data: {
              id: randomUUID(),
              userRegistrationId: domainEvent.userRegistrationId,
              email: domainEvent.email,
              confirmLink: domainEvent.confirmLink,
            },
          });
        });
      },
    });

    domainEvents.register(UserRegistrationConfirmedDomainEvent.name, {
      async handle(domainEvent: UserRegistrationConfirmedDomainEvent) {
        const registration = await repository.getById(
          new UserRegistrationId(domainEvent.userRegistrationId),
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

    this.backgroundProcessor = new BackgroundProcessor();
    this.backgroundProcessor.start([
      { name: 'registrations-outbox', intervalMs: 2000, work: () => outboxProcessor.process() },
      { name: 'registrations-inbox', intervalMs: 2000, work: () => inboxProcessor.process() },
      {
        name: 'registrations-internal',
        intervalMs: 2000,
        work: () => internalProcessor.process(),
      },
    ]);

    this.facade = new RegistrationsModuleFacade(mediator);
    return this.facade;
  }

  stop(): void {
    this.backgroundProcessor?.stop();
    this.backgroundProcessor = null;
  }
}

export function bootstrapRegistrationsModule(options: {
  connectionString: string;
  eventsBus: InMemoryEventsBus;
  executionContextAccessor?: IExecutionContextAccessor;
}): { facade: IRegistrationsModule; stop: () => void } {
  const bootstrap = new RegistrationsModuleBootstrap();
  const facade = bootstrap.start(options);
  return { facade, stop: () => bootstrap.stop() };
}
