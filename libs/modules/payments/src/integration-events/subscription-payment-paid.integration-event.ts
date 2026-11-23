import { IntegrationEvent } from '@building-blocks/infrastructure';

export class SubscriptionPaymentPaidIntegrationEvent extends IntegrationEvent {
  constructor(
    readonly paymentId: string,
    readonly payerId: string,
    readonly period: string,
    readonly countryCode: string,
    readonly expirationDate: Date,
    id?: string,
    occurredOn?: Date,
  ) {
    super(id, occurredOn);
  }
}
