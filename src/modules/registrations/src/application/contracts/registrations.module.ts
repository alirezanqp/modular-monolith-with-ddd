import { ICommand, ICommandWithResult, IQuery } from '@building-blocks/application';

export interface IRegistrationsModule {
  executeCommand<TResult>(command: ICommandWithResult<TResult>): Promise<TResult>;
  executeCommand(command: ICommand): Promise<void>;
  executeQuery<TResult>(query: IQuery<TResult>): Promise<TResult>;
}
