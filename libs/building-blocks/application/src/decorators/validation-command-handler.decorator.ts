import { ICommand } from '../commands/command';
import { ICommandHandler, ICommandHandlerWithResult } from '../commands/command-handler';
import { ICommandValidator } from '../validation/command-validator';
import { InvalidCommandException } from '../validation/invalid-command.exception';

export class ValidationCommandHandlerDecorator<TCommand extends ICommand>
  implements ICommandHandler<TCommand>
{
  constructor(
    private readonly decorated: ICommandHandler<TCommand>,
    private readonly validators: ICommandValidator<TCommand>[],
  ) {}

  async handle(command: TCommand): Promise<void> {
    this.validate(command);
    await this.decorated.handle(command);
  }

  private validate(command: TCommand): void {
    const errors = this.validators
      .flatMap((validator) => validator.validate(command))
      .filter((error) => error !== null && error !== undefined);

    if (errors.length > 0) {
      const message = ['Invalid command, reason:', ...errors.map((e) => e.errorMessage)].join(
        '\n',
      );
      throw new InvalidCommandException(message);
    }
  }
}

export class ValidationCommandHandlerWithResultDecorator<
  TCommand extends ICommand & { __resultType?: TResult },
  TResult,
> implements ICommandHandlerWithResult<TCommand, TResult>
{
  constructor(
    private readonly decorated: ICommandHandlerWithResult<TCommand, TResult>,
    private readonly validators: ICommandValidator<TCommand>[],
  ) {}

  async handle(command: TCommand): Promise<TResult> {
    const errors = this.validators
      .flatMap((validator) => validator.validate(command))
      .filter((error) => error !== null && error !== undefined);

    if (errors.length > 0) {
      const message = ['Invalid command, reason:', ...errors.map((e) => e.errorMessage)].join(
        '\n',
      );
      throw new InvalidCommandException(message);
    }

    return this.decorated.handle(command);
  }
}
