import { CommandBaseWithResult } from '@building-blocks/application';

export class RegisterNewUserCommand extends CommandBaseWithResult<string> {
  constructor(
    readonly login: string,
    readonly password: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly confirmLink?: string,
  ) {
    super();
  }
}
