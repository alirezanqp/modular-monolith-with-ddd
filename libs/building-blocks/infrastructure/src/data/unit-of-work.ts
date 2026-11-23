import { Entity } from '@building-blocks/domain';
import { IUnitOfWork } from '@building-blocks/application';
import { DomainEventsDispatcher } from '../domain-events/domain-events-dispatcher';
import { SqlConnectionFactory, transactionStorage } from './sql-connection.factory';
import { OutboxAccessor } from '../outbox/outbox-accessor';
import { IntegrationEvent } from '../events-bus/integration-event';

export class UnitOfWork implements IUnitOfWork {
  private readonly aggregates: Entity[] = [];
  private readonly integrationEvents: IntegrationEvent[] = [];

  constructor(
    private readonly sqlConnectionFactory: SqlConnectionFactory,
    private readonly domainEventsDispatcher: DomainEventsDispatcher,
    private readonly outboxAccessor: OutboxAccessor,
    private readonly schema: string,
  ) {}

  trackAggregate(aggregate: Entity): void {
    if (!this.aggregates.includes(aggregate)) {
      this.aggregates.push(aggregate);
    }
  }

  enqueueIntegrationEvent(event: IntegrationEvent): void {
    this.integrationEvents.push(event);
  }

  async commit(commandId?: string, isInternalCommand = false): Promise<void> {
    const domainEvents = this.aggregates.flatMap((aggregate) => [...aggregate.domainEvents]);
    for (const aggregate of this.aggregates) {
      aggregate.clearDomainEvents();
    }

    await this.domainEventsDispatcher.dispatch(domainEvents);

    const tx = transactionStorage.getStore();
    if (!tx) {
      await this.sqlConnectionFactory.withTransaction(async (client) => {
        await this.persistSideEffects(client, commandId, isInternalCommand);
      });
    } else {
      await this.persistSideEffects(tx.client, commandId, isInternalCommand);
    }

    this.aggregates.length = 0;
    this.integrationEvents.length = 0;
  }

  private async persistSideEffects(
    client: import('pg').PoolClient,
    commandId: string | undefined,
    isInternalCommand: boolean,
  ): Promise<void> {
    for (const integrationEvent of this.integrationEvents) {
      await this.outboxAccessor.add(client, integrationEvent);
    }

    if (isInternalCommand && commandId) {
      await client.query(
        `UPDATE ${this.schema}.internal_commands SET processed_date = NOW() WHERE id = $1`,
        [commandId],
      );
    }
  }
}
