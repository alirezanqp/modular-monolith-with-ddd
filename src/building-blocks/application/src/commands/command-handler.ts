import { ICommand, ICommandWithResult } from './command';

export interface ICommandHandler<TCommand extends ICommand> {
  handle(command: TCommand): Promise<void>;
}

export interface ICommandHandlerWithResult<
  TCommand extends ICommandWithResult<TResult>,
  TResult,
> {
  handle(command: TCommand): Promise<TResult>;
}
