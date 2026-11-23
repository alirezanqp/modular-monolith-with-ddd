import { PoolClient } from 'pg';

export class InboxAccessor {
  constructor(private readonly schema: string) {}

  async exists(client: PoolClient, id: string): Promise<boolean> {
    const result = await client.query(
      `SELECT 1 FROM ${this.schema}.inbox_messages WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async add(
    client: PoolClient,
    message: { id: string; occurredOn: Date; type: string; data: string },
  ): Promise<void> {
    await client.query(
      `INSERT INTO ${this.schema}.inbox_messages (id, occurred_on, type, data, processed_date)
       VALUES ($1, $2, $3, $4, NULL)
       ON CONFLICT (id) DO NOTHING`,
      [message.id, message.occurredOn, message.type, message.data],
    );
  }

  async getUnprocessed(client: PoolClient, batchSize = 20): Promise<
    Array<{ id: string; occurredOn: Date; type: string; data: string }>
  > {
    const result = await client.query(
      `SELECT id, occurred_on AS "occurredOn", type, data
       FROM ${this.schema}.inbox_messages
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
      `UPDATE ${this.schema}.inbox_messages SET processed_date = NOW() WHERE id = $1`,
      [id],
    );
  }
}
