import { ICommand, ICommandWithResult } from '../commands/command';
import { IQuery } from '../queries/query';
import { IExecutionContextAccessor } from '../execution-context/execution-context-accessor';
import {
  LoggingCommandHandlerDecorator,
  LoggingCommandHandlerWithResultDecorator,
} from '../decorators/logging-command-handler.decorator';
import {
  ValidationCommandHandlerDecorator,
  ValidationCommandHandlerWithResultDecorator,
} from '../decorators/validation-command-handler.decorator';
import {
  IUnitOfWork,
  UnitOfWorkCommandHandlerDecorator,
  UnitOfWorkCommandHandlerWithResultDecorator,
} from '../decorators/unit-of-work-command-handler.decorator';
import { HandlerRegistry } from './handler-registry';

export type TransactionRunner = <T>(work: () => Promise<T>) => Promise<T>;

export class Mediator {
  constructor(
    private readonly registry: HandlerRegistry,
    private readonly executionContextAccessor: IExecutionContextAccessor,
    private readonly unitOfWork: IUnitOfWork,
    private readonly runInTransaction: TransactionRunner = async (work) => work(),
  ) {}

  async send<TResult>(command: ICommandWithResult<TResult>): Promise<TResult>;
  async send(command: ICommand): Promise<void>;
  async send(command: ICommand): Promise<unknown> {
    return this.runInTransaction(async () => {
      const commandName = command.constructor.name;

      const handlerWithResult = this.registry.getCommandHandlerWithResult(commandName);
      if (handlerWithResult) {
        const validators = this.registry.getValidators(commandName);
        const decorated = new UnitOfWorkCommandHandlerWithResultDecorator(
          new ValidationCommandHandlerWithResultDecorator(
            new LoggingCommandHandlerWithResultDecorator(
              handlerWithResult,
              this.executionContextAccessor,
            ),
            validators,
          ),
          this.unitOfWork,
        );
        return decorated.handle(command as ICommandWithResult<unknown>);
      }

      const handler = this.registry.getCommandHandler(commandName);
      if (!handler) {
        throw new Error(`No command handler registered for ${commandName}`);
      }

      const validators = this.registry.getValidators(commandName);
      const decorated = new UnitOfWorkCommandHandlerDecorator(
        new ValidationCommandHandlerDecorator(
          new LoggingCommandHandlerDecorator(handler, this.executionContextAccessor),
          validators,
        ),
        this.unitOfWork,
      );

      await decorated.handle(command);
      return undefined;
    });
  }

  async query<TResult>(query: IQuery<TResult>): Promise<TResult> {
    const queryName = query.constructor.name;
    const handler = this.registry.getQueryHandler(queryName);
    if (!handler) {
      throw new Error(`No query handler registered for ${queryName}`);
    }
    return handler.handle(query) as Promise<TResult>;
  }
}
