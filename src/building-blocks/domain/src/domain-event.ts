export interface IDomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
}
