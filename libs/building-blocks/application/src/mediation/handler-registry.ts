import { ICommand, ICommandWithResult } from '../commands/command';
import {
  ICommandHandler,
  ICommandHandlerWithResult,
} from '../commands/command-handler';
import { IQuery } from '../queries/query';
import { IQueryHandler } from '../queries/query-handler';
import { ICommandValidator } from '../validation/command-validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export class HandlerRegistry {
  private readonly commandHandlers = new Map<string, ICommandHandler<ICommand>>();
  private readonly commandHandlersWithResult = new Map<
    string,
    ICommandHandlerWithResult<ICommandWithResult<unknown>, unknown>
  >();
  private readonly queryHandlers = new Map<string, IQueryHandler<IQuery<unknown>, unknown>>();
  private readonly validators = new Map<string, ICommandValidator<ICommand>[]>();

  registerCommandHandler<TCommand extends ICommand>(
    commandType: Constructor<TCommand>,
    handler: ICommandHandler<TCommand>,
  ): void {
    this.commandHandlers.set(commandType.name, handler as ICommandHandler<ICommand>);
  }

  registerCommandHandlerWithResult<TCommand extends ICommandWithResult<TResult>, TResult>(
    commandType: Constructor<TCommand>,
    handler: ICommandHandlerWithResult<TCommand, TResult>,
  ): void {
    this.commandHandlersWithResult.set(
      commandType.name,
      handler as ICommandHandlerWithResult<ICommandWithResult<unknown>, unknown>,
    );
  }

  registerQueryHandler<TQuery extends IQuery<TResult>, TResult>(
    queryType: Constructor<TQuery>,
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    this.queryHandlers.set(queryType.name, handler as IQueryHandler<IQuery<unknown>, unknown>);
  }

  registerValidator<TCommand extends ICommand>(
    commandType: Constructor<TCommand>,
    validator: ICommandValidator<TCommand>,
  ): void {
    const key = commandType.name;
    const existing = this.validators.get(key) ?? [];
    existing.push(validator as ICommandValidator<ICommand>);
    this.validators.set(key, existing);
  }

  getCommandHandler(commandName: string): ICommandHandler<ICommand> | undefined {
    return this.commandHandlers.get(commandName);
  }

  getCommandHandlerWithResult(
    commandName: string,
  ): ICommandHandlerWithResult<ICommandWithResult<unknown>, unknown> | undefined {
    return this.commandHandlersWithResult.get(commandName);
  }

  getQueryHandler(queryName: string): IQueryHandler<IQuery<unknown>, unknown> | undefined {
    return this.queryHandlers.get(queryName);
  }

  getValidators(commandName: string): ICommandValidator<ICommand>[] {
    return this.validators.get(commandName) ?? [];
  }
}
