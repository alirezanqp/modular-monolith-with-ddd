import { randomUUID } from 'crypto';

export abstract class IntegrationEvent {
  readonly id: string;
  readonly occurredOn: Date;

  protected constructor(id?: string, occurredOn?: Date) {
    this.id = id ?? randomUUID();
    this.occurredOn = occurredOn ?? new Date();
  }
}
