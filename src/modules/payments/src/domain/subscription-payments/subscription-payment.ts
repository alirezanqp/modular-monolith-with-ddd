import { EventSourcedAggregate } from '../seedwork/event-sourced-aggregate';
import {
  SubscriptionPaymentCreated,
  SubscriptionPaymentExpired,
  SubscriptionPaymentPaid,
} from './events/subscription-payment-created';

export class SubscriptionPayment extends EventSourcedAggregate {
  private paymentId!: string;
  private payerId!: string;
  private period!: string;
  private countryCode!: string;
  private value!: number;
  private currency!: string;
  private status: 'WaitingForPayment' | 'Paid' | 'Expired' = 'WaitingForPayment';

  static buy(
    paymentId: string,
    payerId: string,
    period: string,
    countryCode: string,
    value: number,
    currency: string,
  ): SubscriptionPayment {
    const agg = new SubscriptionPayment();
    agg.apply(new SubscriptionPaymentCreated(paymentId, payerId, period, countryCode, value, currency));
    return agg;
  }

  applySubscriptionPaymentCreated(e: SubscriptionPaymentCreated) {
    this.paymentId = e.paymentId;
    this.payerId = e.payerId;
    this.period = e.period;
    this.countryCode = e.countryCode;
    this.value = e.value;
    this.currency = e.currency;
    this.status = 'WaitingForPayment';
  }

  markAsPaid() {
    if (this.status !== 'WaitingForPayment') throw new Error('Payment cannot be marked as paid');
    const months = this.period === 'Year' ? 12 : this.period === 'HalfYear' ? 6 : 1;
    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + months);
    this.apply(
      new SubscriptionPaymentPaid(this.paymentId, this.payerId, this.period, this.countryCode, expiration),
    );
  }

  applySubscriptionPaymentPaid() {
    this.status = 'Paid';
  }

  expire() {
    if (this.status !== 'WaitingForPayment') return;
    this.apply(new SubscriptionPaymentExpired(this.paymentId));
  }

  applySubscriptionPaymentExpired() {
    this.status = 'Expired';
  }

  getPaymentId() { return this.paymentId; }
  getPayerId() { return this.payerId; }
  getPeriod() { return this.period; }
  getCountryCode() { return this.countryCode; }
  getValue() { return this.value; }
  getCurrency() { return this.currency; }
  getStatus() { return this.status; }
}
