import { InternalCommandBase } from '@building-blocks/application';

export class CreateMemberCommand extends InternalCommandBase {
  constructor(
    id: string,
    public readonly memberId: string,
    public readonly login: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly name?: string,
  ) {
    super(id);
  }

  static fromJson(data: Record<string, unknown>): CreateMemberCommand {
    return new CreateMemberCommand(
      String(data.id),
      String(data.memberId),
      String(data.login),
      String(data.email),
      String(data.firstName),
      String(data.lastName),
      data.name
        ? String(data.name)
        : `${String(data.firstName)} ${String(data.lastName)}`,
    );
  }
}
