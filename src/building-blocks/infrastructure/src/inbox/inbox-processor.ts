import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SqlConnectionFactory } from '../data/sql-connection.factory';
import { InternalCommandsAccessor } from '../internal-commands/internal-commands-accessor';
import { deserialize } from '../serialization/json';
import { InboxAccessor } from './inbox-accessor';

export type InboxCommandMapper = (
  type: string,
  data: Record<string, unknown>,
) => { id: string; type: string; data: unknown } | null;

export class InboxProcessor {
  private readonly logger = new Logger(InboxProcessor.name);

  constructor(
    private readonly sqlConnectionFactory: SqlConnectionFactory,
    private readonly inboxAccessor: InboxAccessor,
    private readonly internalCommandsAccessor: InternalCommandsAccessor,
    private readonly commandMapper: InboxCommandMapper,
  ) {}

  async process(): Promise<void> {
    await this.sqlConnectionFactory.withTransaction(async (client) => {
      const messages = await this.inboxAccessor.getUnprocessed(client);
      for (const message of messages) {
        const payload = deserialize<Record<string, unknown>>(message.data);
        const command = this.commandMapper(message.type, payload);
        if (!command) {
          this.logger.warn(`No inbox command mapping for ${message.type}`);
          await this.inboxAccessor.markProcessed(client, message.id);
          continue;
        }

        await this.internalCommandsAccessor.add(client, {
          id: command.id || randomUUID(),
          type: command.type,
          data: command.data,
        });
        await this.inboxAccessor.markProcessed(client, message.id);
      }
    });
  }
}
