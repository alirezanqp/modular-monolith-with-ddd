import { PoolClient } from 'pg';

export interface ISqlConnectionFactory {
  getOpenConnection(): Promise<PoolClient>;
  getConnectionString(): string;
}
