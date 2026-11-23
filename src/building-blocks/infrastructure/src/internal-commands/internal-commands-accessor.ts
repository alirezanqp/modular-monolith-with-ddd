import { PoolClient } from 'pg';
import { serialize } from '../serialization/json';

export class InternalCommandsAccessor {
  constructor(private readonly schema: string) {}

  async add(
    client: PoolClient,
    command: { id: string; type: string; data: unknown; enqueueDate?: Date },
  ): Promise<void> {
    await client.query(
      `INSERT INTO ${this.schema}.internal_commands (id, enqueue_date, type, data, processed_date, error)
       VALUES ($1, $2, $3, $4, NULL, NULL)`,
      [command.id, command.enqueueDate ?? new Date(), command.type, serialize(command.data)],
    );
  }

  async getUnprocessed(client: PoolClient, batchSize = 20): Promise<
    Array<{ id: string; type: string; data: string }>
  > {
    const result = await client.query(
      `SELECT id, type, data
       FROM ${this.schema}.internal_commands
       WHERE processed_date IS NULL
       ORDER BY enqueue_date
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [batchSize],
    );
    return result.rows;
  }

  async markProcessed(client: PoolClient, id: string): Promise<void> {
    await client.query(
      `UPDATE ${this.schema}.internal_commands SET processed_date = NOW() WHERE id = $1`,
      [id],
    );
  }

  async markError(client: PoolClient, id: string, error: string): Promise<void> {
    await client.query(
      `UPDATE ${this.schema}.internal_commands SET error = $2 WHERE id = $1`,
      [id, error],
    );
  }
}
