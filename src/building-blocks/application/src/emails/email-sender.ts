import { EmailMessage } from './email-message';

export interface IEmailSender {
  sendEmail(message: EmailMessage): Promise<void>;
}
