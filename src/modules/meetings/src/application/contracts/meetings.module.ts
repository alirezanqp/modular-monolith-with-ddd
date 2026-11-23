import { ICommand, ICommandWithResult, IQuery } from '@building-blocks/application';
export interface IMeetingsModule {
  executeCommand(command: ICommand): Promise<void>;
  executeCommand<TResult>(command: ICommandWithResult<TResult>): Promise<TResult>;
  executeQuery<TResult>(query: IQuery<TResult>): Promise<TResult>;
}
