import { randomUUID } from 'crypto';
import { IDomainEvent } from './domain-event';

export abstract class DomainEventBase implements IDomainEvent {
  readonly id: string;
  readonly occurredOn: Date;

  protected constructor() {
    this.id = randomUUID();
    this.occurredOn = new Date();
  }
}
