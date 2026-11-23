import { Logger } from '@nestjs/common';
import { ICommand } from '@building-blocks/application';
import { Mediator } from '@building-blocks/application';
import { SqlConnectionFactory } from '../data/sql-connection.factory';
import { deserialize } from '../serialization/json';
import { InternalCommandsAccessor } from './internal-commands-accessor';

export type InternalCommandFactory = (type: string, data: string) => ICommand | null;

export class InternalCommandsProcessor {
  private readonly logger = new Logger(InternalCommandsProcessor.name);

  constructor(
    private readonly sqlConnectionFactory: SqlConnectionFactory,
    private readonly internalCommandsAccessor: InternalCommandsAccessor,
    private readonly mediator: Mediator,
    private readonly commandFactory: InternalCommandFactory,
  ) {}

  async process(): Promise<void> {
    const client = await this.sqlConnectionFactory.getOpenConnection();
    let messages: Array<{ id: string; type: string; data: string }> = [];
    try {
      await client.query('BEGIN');
      messages = await this.internalCommandsAccessor.getUnprocessed(client);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    for (const message of messages) {
      try {
        const command = this.commandFactory(message.type, message.data);
        if (!command) {
          this.logger.warn(`Unknown internal command type ${message.type}`);
          await this.sqlConnectionFactory.withTransaction(async (tx) => {
            await this.internalCommandsAccessor.markProcessed(tx, message.id);
          });
          continue;
        }

        await this.mediator.send(command);
      } catch (error) {
        this.logger.error(`Internal command ${message.type} failed`, error as Error);
        await this.sqlConnectionFactory.withTransaction(async (tx) => {
          await this.internalCommandsAccessor.markError(
            tx,
            message.id,
            error instanceof Error ? error.message : String(error),
          );
        });
      }
    }
  }
}

export function createCommandFactory(
  constructors: Record<string, { fromJson(data: Record<string, unknown>): ICommand }>,
): InternalCommandFactory {
  return (type, data) => {
    const ctor = constructors[type];
    if (!ctor) {
      return null;
    }
    return ctor.fromJson(deserialize<Record<string, unknown>>(data));
  };
}
