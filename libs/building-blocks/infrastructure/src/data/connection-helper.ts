import { PoolClient } from 'pg';
import { transactionStorage } from './sql-connection.factory';

export function releaseIfNotInTransaction(client: PoolClient): void {
  if (!transactionStorage.getStore()) {
    client.release();
  }
}
