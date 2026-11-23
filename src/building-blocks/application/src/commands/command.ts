import { randomUUID } from 'crypto';

export interface ICommand {
  readonly id: string;
}

export interface ICommandWithResult<TResult> extends ICommand {
  readonly __resultType?: TResult;
}

export abstract class CommandBase implements ICommand {
  readonly id: string;

  protected constructor(id?: string) {
    this.id = id ?? randomUUID();
  }
}

export abstract class CommandBaseWithResult<TResult>
  extends CommandBase
  implements ICommandWithResult<TResult>
{
  readonly __resultType?: TResult;
}
