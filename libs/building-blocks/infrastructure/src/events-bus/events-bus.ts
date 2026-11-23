import { IntegrationEvent } from './integration-event';

export interface IIntegrationEventHandler<TEvent extends IntegrationEvent = IntegrationEvent> {
  handle(event: TEvent): Promise<void>;
}

export interface IEventsBus {
  publish(event: IntegrationEvent): Promise<void>;
  subscribe<TEvent extends IntegrationEvent>(
    eventTypeName: string,
    handler: IIntegrationEventHandler<TEvent>,
  ): void;
  start(): void;
  stop(): void;
}
