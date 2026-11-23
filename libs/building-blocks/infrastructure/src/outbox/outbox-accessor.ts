import { PoolClient } from 'pg';
import { IntegrationEvent } from '../events-bus/integration-event';
import { serialize } from '../serialization/json';

export class OutboxAccessor {
  constructor(private readonly schema: string) {}

  async add(client: PoolClient, event: IntegrationEvent): Promise<void> {
    await client.query(
      `INSERT INTO ${this.schema}.outbox_messages (id, occurred_on, type, data, processed_date)
       VALUES ($1, $2, $3, $4, NULL)`,
      [event.id, event.occurredOn, event.constructor.name, serialize(event)],
    );
  }

  async getUnprocessed(client: PoolClient, batchSize = 20): Promise<
    Array<{ id: string; occurredOn: Date; type: string; data: string }>
  > {
    const result = await client.query(
      `SELECT id, occurred_on AS "occurredOn", type, data
       FROM ${this.schema}.outbox_messages
       WHERE processed_date IS NULL
       ORDER BY occurred_on
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [batchSize],
    );
    return result.rows;
  }

  async markProcessed(client: PoolClient, id: string): Promise<void> {
    await client.query(
      `UPDATE ${this.schema}.outbox_messages SET processed_date = NOW() WHERE id = $1`,
      [id],
    );
  }
}
