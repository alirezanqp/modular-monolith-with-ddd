import { Logger } from '@nestjs/common';
import { IEventsBus, IIntegrationEventHandler } from './events-bus';
import { IntegrationEvent } from './integration-event';

export class InMemoryEventsBus implements IEventsBus {
  private readonly logger = new Logger(InMemoryEventsBus.name);
  private readonly handlers = new Map<string, IIntegrationEventHandler[]>();
  private started = false;

  subscribe<TEvent extends IntegrationEvent>(
    eventTypeName: string,
    handler: IIntegrationEventHandler<TEvent>,
  ): void {
    const existing = this.handlers.get(eventTypeName) ?? [];
    existing.push(handler as IIntegrationEventHandler);
    this.handlers.set(eventTypeName, existing);
  }

  async publish(event: IntegrationEvent): Promise<void> {
    if (!this.started) {
      this.logger.warn(`Events bus not started; dropping ${event.constructor.name}`);
      return;
    }

    const handlers = this.handlers.get(event.constructor.name) ?? [];
    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        this.logger.error(
          `Integration event handler failed for ${event.constructor.name}`,
          error as Error,
        );
      }
    }
  }

  start(): void {
    this.started = true;
  }

  stop(): void {
    this.started = false;
  }
}
