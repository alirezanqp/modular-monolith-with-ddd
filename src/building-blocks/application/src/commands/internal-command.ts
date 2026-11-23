import { CommandBase, CommandBaseWithResult } from './command';

export abstract class InternalCommandBase extends CommandBase {
  protected constructor(id: string) {
    super(id);
  }
}

export abstract class InternalCommandBaseWithResult<TResult> extends CommandBaseWithResult<TResult> {
  protected constructor(id: string) {
    super(id);
  }
}

export function isInternalCommand(command: { id: string }): boolean {
  return command instanceof InternalCommandBase || command instanceof InternalCommandBaseWithResult;
}
