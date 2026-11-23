import { ICommand, ICommandWithResult } from '../commands/command';
import { IQuery } from '../queries/query';

export interface IModuleFacade {
  executeCommand<TResult>(command: ICommandWithResult<TResult>): Promise<TResult>;
  executeCommand(command: ICommand): Promise<void>;
  executeQuery<TResult>(query: IQuery<TResult>): Promise<TResult>;
}

export type IMeetingsModule = IModuleFacade;
export type IAdministrationModule = IModuleFacade;
export type IModule = IModuleFacade;
