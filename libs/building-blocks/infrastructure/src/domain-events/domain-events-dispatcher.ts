import { IDomainEvent } from '@building-blocks/domain';

export interface IDomainEventNotificationHandler {
  handle(domainEvent: IDomainEvent): Promise<void>;
}

export class DomainEventsDispatcher {
  private readonly handlers = new Map<string, IDomainEventNotificationHandler[]>();

  register(eventTypeName: string, handler: IDomainEventNotificationHandler): void {
    const existing = this.handlers.get(eventTypeName) ?? [];
    existing.push(handler);
    this.handlers.set(eventTypeName, existing);
  }

  async dispatch(domainEvents: ReadonlyArray<IDomainEvent>): Promise<void> {
    for (const domainEvent of domainEvents) {
      const eventHandlers = this.handlers.get(domainEvent.constructor.name) ?? [];
      for (const handler of eventHandlers) {
        await handler.handle(domainEvent);
      }
    }
  }
}
