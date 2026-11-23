import { Logger } from '@nestjs/common';
import { ICommand } from '../commands/command';
import { ICommandHandler, ICommandHandlerWithResult } from '../commands/command-handler';
import { IExecutionContextAccessor } from '../execution-context/execution-context-accessor';

export class LoggingCommandHandlerDecorator<TCommand extends ICommand>
  implements ICommandHandler<TCommand>
{
  private readonly logger = new Logger('CommandHandler');

  constructor(
    private readonly decorated: ICommandHandler<TCommand>,
    private readonly executionContextAccessor: IExecutionContextAccessor,
  ) {}

  async handle(command: TCommand): Promise<void> {
    const commandName = command.constructor.name;
    const correlationId = this.executionContextAccessor.isAvailable
      ? this.executionContextAccessor.correlationId
      : 'n/a';

    this.logger.log(
      `Executing command ${commandName} [${command.id}] correlationId=${correlationId}`,
    );

    try {
      await this.decorated.handle(command);
      this.logger.log(`Command ${commandName} processed successfully`);
    } catch (error) {
      this.logger.error(`Command ${commandName} processing failed`, error as Error);
      throw error;
    }
  }
}

export class LoggingCommandHandlerWithResultDecorator<
  TCommand extends ICommand & { __resultType?: TResult },
  TResult,
> implements ICommandHandlerWithResult<TCommand, TResult>
{
  private readonly logger = new Logger('CommandHandler');

  constructor(
    private readonly decorated: ICommandHandlerWithResult<TCommand, TResult>,
    private readonly executionContextAccessor: IExecutionContextAccessor,
  ) {}

  async handle(command: TCommand): Promise<TResult> {
    const commandName = command.constructor.name;
    const correlationId = this.executionContextAccessor.isAvailable
      ? this.executionContextAccessor.correlationId
      : 'n/a';

    this.logger.log(
      `Executing command ${commandName} [${command.id}] correlationId=${correlationId}`,
    );

    try {
      const result = await this.decorated.handle(command);
      this.logger.log(`Command ${commandName} processed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Command ${commandName} processing failed`, error as Error);
      throw error;
    }
  }
}
