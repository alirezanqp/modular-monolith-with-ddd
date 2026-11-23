import { ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction, serialize, deserialize } from '@building-blocks/infrastructure';
import { randomUUID } from 'crypto';
import { EventSourcedAggregate } from '../../domain/seedwork/event-sourced-aggregate';

export class AggregateStore {
  constructor(private readonly sql: ISqlConnectionFactory) {}

  async save(aggregateId: string, aggregate: EventSourcedAggregate): Promise<void> {
    const events = aggregate.uncommittedEvents;
    if (events.length === 0) return;
    const client = await this.sql.getOpenConnection();
    try {
      let stream = (await client.query('SELECT id, version FROM payments.streams WHERE stream_id=$1', [aggregateId])).rows[0];
      if (!stream) {
        const inserted = await client.query(
          'INSERT INTO payments.streams (stream_id, version, position) VALUES ($1, $2, 0) RETURNING id, version',
          [aggregateId, -1],
        );
        stream = inserted.rows[0];
      }
      let version = stream.version as number;
      for (const event of events) {
        version += 1;
        await client.query(
          `INSERT INTO payments.messages (stream_id, stream_version, message_id, created, type, json_data)
           VALUES ($1,$2,$3,NOW(),$4,$5)`,
          [stream.id, version, randomUUID(), event.constructor.name, serialize(event)],
        );
      }
      await client.query(
        'UPDATE payments.streams SET version=$2, position=(SELECT COALESCE(MAX(position),0) FROM payments.messages WHERE stream_id=$1) WHERE id=$1',
        [stream.id, version],
      );
      aggregate.clearUncommittedEvents();
    } finally {
      releaseIfNotInTransaction(client);
    }
  }

  async load<T extends EventSourcedAggregate>(
    aggregateId: string,
    factory: () => T,
    eventMap: Record<string, new (...args: any[]) => object>,
  ): Promise<T | null> {
    const client = await this.sql.getOpenConnection();
    try {
      const stream = (await client.query('SELECT id FROM payments.streams WHERE stream_id=$1', [aggregateId])).rows[0];
      if (!stream) return null;
      const rows = (await client.query(
        'SELECT type, json_data FROM payments.messages WHERE stream_id=$1 ORDER BY stream_version',
        [stream.id],
      )).rows;
      const aggregate = factory();
      const events = rows.map((row: any) => {
        const ctor = eventMap[row.type];
        const data = deserialize<Record<string, unknown>>(row.json_data);
        if (!ctor) return data;
        const event = Object.create(ctor.prototype);
        Object.assign(event, data);
        Object.defineProperty(event, 'constructor', { value: ctor, configurable: true });
        return event;
      });
      aggregate.loadFromHistory(events);
      return aggregate;
    } finally {
      releaseIfNotInTransaction(client);
    }
  }
}
