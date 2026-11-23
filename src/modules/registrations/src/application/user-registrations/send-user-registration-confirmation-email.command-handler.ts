import { ICommandHandler, IEmailSender } from '@building-blocks/application';
import { SendUserRegistrationConfirmationEmailCommand } from './send-user-registration-confirmation-email.command';

export class SendUserRegistrationConfirmationEmailCommandHandler
  implements ICommandHandler<SendUserRegistrationConfirmationEmailCommand>
{
  constructor(private readonly emailSender: IEmailSender) {}

  async handle(command: SendUserRegistrationConfirmationEmailCommand): Promise<void> {
    const baseLink = command.confirmLink ?? '';
    const link = `${baseLink}${command.userRegistrationId}`;
    const content = `Welcome to MyMeetings application! Please confirm your registration using this <a href="${link}">link</a>.`;

    await this.emailSender.sendEmail({
      from: 'noreply@mymeetings.com',
      to: command.email,
      subject: 'MyMeetings - Please confirm your registration',
      content,
    });
  }
}
