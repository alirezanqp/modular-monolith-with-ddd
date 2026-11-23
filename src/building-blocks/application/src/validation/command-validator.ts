import { ICommand } from '../commands/command';

export interface ValidationError {
  propertyName: string;
  errorMessage: string;
}

export interface ICommandValidator<TCommand extends ICommand> {
  validate(command: TCommand): ValidationError[];
}
