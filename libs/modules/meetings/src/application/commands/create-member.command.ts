import { InternalCommandBase } from '@building-blocks/application';
export class CreateMemberCommand extends InternalCommandBase {
  constructor(id: string, readonly memberId: string, readonly login: string, readonly email: string, readonly firstName: string, readonly lastName: string) { super(id); }
  static fromJson(d: Record<string, unknown>) {
    return new CreateMemberCommand(String(d.id), String(d.memberId), String(d.login), String(d.email), String(d.firstName), String(d.lastName));
  }
}