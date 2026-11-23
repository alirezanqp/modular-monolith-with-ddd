import { InternalCommandBase } from '@building-blocks/application';

export class CreateUserCommand extends InternalCommandBase {
  constructor(
    id: string,
    readonly userId: string,
    readonly login: string,
    readonly password: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
  ) {
    super(id);
  }

  static fromJson(data: Record<string, unknown>): CreateUserCommand {
    return new CreateUserCommand(
      String(data.id),
      String(data.userId),
      String(data.login),
      String(data.password),
      String(data.email),
      String(data.firstName),
      String(data.lastName),
    );
  }
}
