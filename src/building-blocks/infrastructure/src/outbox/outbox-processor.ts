import { Logger } from '@nestjs/common';
import { SqlConnectionFactory } from '../data/sql-connection.factory';
import { IEventsBus } from '../events-bus/events-bus';
import { IntegrationEvent } from '../events-bus/integration-event';
import { deserialize } from '../serialization/json';
import { OutboxAccessor } from './outbox-accessor';

export type IntegrationEventFactory = (type: string, data: string) => IntegrationEvent | null;

export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly sqlConnectionFactory: SqlConnectionFactory,
    private readonly outboxAccessor: OutboxAccessor,
    private readonly eventsBus: IEventsBus,
    private readonly eventFactory: IntegrationEventFactory,
  ) {}

  async process(): Promise<void> {
    await this.sqlConnectionFactory.withTransaction(async (client) => {
      const messages = await this.outboxAccessor.getUnprocessed(client);
      for (const message of messages) {
        const event = this.eventFactory(message.type, message.data);
        if (!event) {
          this.logger.warn(`Unknown outbox event type ${message.type}`);
          await this.outboxAccessor.markProcessed(client, message.id);
          continue;
        }

        await this.eventsBus.publish(event);
        await this.outboxAccessor.markProcessed(client, message.id);
      }
    });
  }
}

export function createTypedEventFactory(
  constructors: Record<string, new (...args: never[]) => IntegrationEvent>,
): IntegrationEventFactory {
  return (type, data) => {
    const ctor = constructors[type];
    if (!ctor) {
      return null;
    }
    const payload = deserialize<Record<string, unknown>>(data);
    const event = Object.create(ctor.prototype) as IntegrationEvent;
    Object.assign(event, payload);
    Object.defineProperty(event, 'constructor', { value: ctor, configurable: true });
    return event;
  };
}
