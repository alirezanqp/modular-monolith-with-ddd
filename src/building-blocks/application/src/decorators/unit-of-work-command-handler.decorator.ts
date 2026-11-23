import { ICommand } from '../commands/command';
import { ICommandHandler, ICommandHandlerWithResult } from '../commands/command-handler';
import { isInternalCommand } from '../commands/internal-command';

import { Entity } from '@building-blocks/domain';

export interface IUnitOfWork {
  trackAggregate?(aggregate: Entity): void;
  enqueueIntegrationEvent?(event: unknown): void;
  commit(commandId?: string, isInternalCommand?: boolean): Promise<void>;
}

export class UnitOfWorkCommandHandlerDecorator<TCommand extends ICommand>
  implements ICommandHandler<TCommand>
{
  constructor(
    private readonly decorated: ICommandHandler<TCommand>,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async handle(command: TCommand): Promise<void> {
    await this.decorated.handle(command);
    await this.unitOfWork.commit(command.id, isInternalCommand(command));
  }
}

export class UnitOfWorkCommandHandlerWithResultDecorator<
  TCommand extends ICommand & { __resultType?: TResult },
  TResult,
> implements ICommandHandlerWithResult<TCommand, TResult>
{
  constructor(
    private readonly decorated: ICommandHandlerWithResult<TCommand, TResult>,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async handle(command: TCommand): Promise<TResult> {
    const result = await this.decorated.handle(command);
    await this.unitOfWork.commit(command.id, isInternalCommand(command));
    return result;
  }
}
