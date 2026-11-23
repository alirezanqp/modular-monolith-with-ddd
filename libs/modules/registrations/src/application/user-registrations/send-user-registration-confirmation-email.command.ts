import { InternalCommandBase } from '@building-blocks/application';

export class SendUserRegistrationConfirmationEmailCommand extends InternalCommandBase {
  constructor(
    id: string,
    readonly userRegistrationId: string,
    readonly email: string,
    readonly confirmLink?: string,
  ) {
    super(id);
  }

  static fromJson(data: Record<string, unknown>): SendUserRegistrationConfirmationEmailCommand {
    return new SendUserRegistrationConfirmationEmailCommand(
      String(data.id),
      String(data.userRegistrationId),
      String(data.email),
      data.confirmLink ? String(data.confirmLink) : undefined,
    );
  }
}
