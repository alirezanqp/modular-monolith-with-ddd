export class SubscriptionPaymentCreated {
  constructor(
    readonly paymentId: string,
    readonly payerId: string,
    readonly period: string,
    readonly countryCode: string,
    readonly value: number,
    readonly currency: string,
  ) {}
}
export class SubscriptionPaymentPaid {
  constructor(
    readonly paymentId: string,
    readonly payerId: string,
    readonly period: string,
    readonly countryCode: string,
    readonly expirationDate: Date,
  ) {}
}
export class SubscriptionPaymentExpired {
  constructor(readonly paymentId: string) {}
}
