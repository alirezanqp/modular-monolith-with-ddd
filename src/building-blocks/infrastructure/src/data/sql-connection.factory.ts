import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Pool, PoolClient } from 'pg';
import { ISqlConnectionFactory } from '@building-blocks/application';

export interface TransactionContext {
  client: PoolClient;
}

export const transactionStorage = new AsyncLocalStorage<TransactionContext>();

@Injectable()
export class SqlConnectionFactory implements ISqlConnectionFactory, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  getConnectionString(): string {
    return this.connectionString;
  }

  async getOpenConnection(): Promise<PoolClient> {
    const tx = transactionStorage.getStore();
    if (tx) {
      return tx.client;
    }
    return this.pool.connect();
  }

  async withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const existing = transactionStorage.getStore();
    if (existing) {
      return work(existing.client);
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await transactionStorage.run({ client }, async () => {
        const value = await work(client);
        await client.query('COMMIT');
        return value;
      });
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
