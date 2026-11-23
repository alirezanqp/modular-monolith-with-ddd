import { EmailMessage, IEmailSender } from '@building-blocks/application';
import { randomUUID } from 'crypto';
import { SqlConnectionFactory, transactionStorage } from '../data/sql-connection.factory';

export class EmailSender implements IEmailSender {
  constructor(private readonly sqlConnectionFactory: SqlConnectionFactory) {}

  async sendEmail(message: EmailMessage): Promise<void> {
    const tx = transactionStorage.getStore();
    if (tx) {
      await tx.client.query(
        `INSERT INTO app.emails (id, from_address, to_address, subject, content, received_date)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [randomUUID(), message.from, message.to, message.subject, message.content],
      );
      return;
    }

    const client = await this.sqlConnectionFactory.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO app.emails (id, from_address, to_address, subject, content, received_date)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [randomUUID(), message.from, message.to, message.subject, message.content],
      );
    } finally {
      client.release();
    }
  }
}
