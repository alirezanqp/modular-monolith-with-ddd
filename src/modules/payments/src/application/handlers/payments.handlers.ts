import { ICommandHandler, ICommandHandlerWithResult, IQueryHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { UnitOfWork, releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { randomUUID } from 'crypto';
import { SubscriptionPayment } from '../../domain/subscription-payments/subscription-payment';
import { SubscriptionPaymentCreated, SubscriptionPaymentExpired, SubscriptionPaymentPaid } from '../../domain/subscription-payments/events/subscription-payment-created';
import { AggregateStore } from '../../infrastructure/aggregate-store/aggregate-store';
import { SubscriptionPaymentPaidIntegrationEvent } from '../../integration-events/subscription-payment-paid.integration-event';
import * as C from '../commands/payments.commands';

export class BuySubscriptionCommandHandler implements ICommandHandlerWithResult<C.BuySubscriptionCommand, string> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly store: AggregateStore) {}
  async handle(command: C.BuySubscriptionCommand) {
    const client = await this.sql.getOpenConnection();
    let price: any;
    try {
      price = (await client.query(
        `SELECT money_value, money_currency FROM payments.price_list_items
         WHERE subscription_period_code=$1 AND country_code=$2 AND is_active=true LIMIT 1`,
        [command.subscriptionPeriodCode, command.countryCode],
      )).rows[0];
    } finally { releaseIfNotInTransaction(client); }
    if (!price) throw new Error('Price list item not found');
    const paymentId = randomUUID();
    const payment = SubscriptionPayment.buy(
      paymentId, command.payerId, command.subscriptionPeriodCode, command.countryCode,
      Number(price.money_value), price.money_currency,
    );
    await this.store.save(paymentId, payment);
    const c2 = await this.sql.getOpenConnection();
    try {
      const periodMonths =
        command.subscriptionPeriodCode === 'Year'
          ? 12
          : command.subscriptionPeriodCode === 'HalfYear'
            ? 6
            : 1;
      await c2.query(
        `INSERT INTO payments.subscription_payments
         (payment_id, payment_status, period_type, period, period_months, payer_id, money_value, money_currency, date)
         VALUES ($1,'WaitingForPayment',$2,$2,$3,$4,$5,$6,NOW())`,
        [
          paymentId,
          command.subscriptionPeriodCode,
          periodMonths,
          command.payerId,
          Number(price.money_value),
          price.money_currency,
        ],
      );
    } finally { releaseIfNotInTransaction(c2); }
    return paymentId;
  }
}

export class MarkSubscriptionPaymentAsPaidCommandHandler implements ICommandHandler<C.MarkSubscriptionPaymentAsPaidCommand> {
  constructor(
    private readonly sql: ISqlConnectionFactory,
    private readonly store: AggregateStore,
    private readonly uow: UnitOfWork,
  ) {}
  async handle(command: C.MarkSubscriptionPaymentAsPaidCommand) {
    const payment = await this.store.load(command.paymentId, () => new SubscriptionPayment(), {
      SubscriptionPaymentCreated, SubscriptionPaymentPaid, SubscriptionPaymentExpired,
    });
    if (!payment) throw new Error('Payment not found');
    payment.markAsPaid();
    await this.store.save(command.paymentId, payment);
    const months = payment.getPeriod() === 'Year' ? 12 : payment.getPeriod() === 'HalfYear' ? 6 : 1;
    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + months);
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `UPDATE payments.subscription_payments SET payment_status='Paid', subscription_id=$2 WHERE payment_id=$1`,
        [command.paymentId, command.paymentId],
      );
      await client.query(
        `INSERT INTO payments.subscription_details (id, period, status, country_code, expiration_date, payer_id)
         VALUES ($1,$2,'Active',$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET status='Active', expiration_date=$4`,
        [command.paymentId, payment.getPeriod(), payment.getCountryCode(), expiration, payment.getPayerId()],
      );
    } finally { releaseIfNotInTransaction(client); }
    this.uow.enqueueIntegrationEvent(
      new SubscriptionPaymentPaidIntegrationEvent(
        command.paymentId, payment.getPayerId(), payment.getPeriod(), payment.getCountryCode(), expiration,
      ),
    );
  }
}

export class CreatePayerCommandHandler implements ICommandHandler<C.CreatePayerCommand> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(command: C.CreatePayerCommand) {
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO payments.payers (id, login, email, first_name, last_name, name)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [command.payerId, command.login, command.email, command.firstName, command.lastName, `${command.firstName} ${command.lastName}`],
      );
    } finally { releaseIfNotInTransaction(client); }
  }
}

export class CreateMeetingFeeCommandHandler implements ICommandHandler<C.CreateMeetingFeeCommand> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(command: C.CreateMeetingFeeCommand) {
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO payments.meeting_fees (id, payer_id, meeting_id, fee_value, fee_currency, status)
         VALUES ($1,$2,$3,$4,$5,'WaitingForPayment') ON CONFLICT DO NOTHING`,
        [command.meetingFeeId, command.payerId, command.meetingId, command.feeValue, command.feeCurrency],
      );
    } finally { releaseIfNotInTransaction(client); }
  }
}

export class CreatePriceListItemCommandHandler implements ICommandHandlerWithResult<C.CreatePriceListItemCommand, string> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(command: C.CreatePriceListItemCommand) {
    const id = randomUUID();
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO payments.price_list_items
         (id, subscription_period_code, country_code, money_value, money_currency, price_list_item_category_code, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,true)`,
        [id, command.subscriptionPeriodCode, command.countryCode, command.moneyValue, command.moneyCurrency, command.categoryCode],
      );
    } finally { releaseIfNotInTransaction(client); }
    return id;
  }
}

export class GetPriceListItemsQueryHandler implements IQueryHandler<C.GetPriceListItemsQuery, any[]> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle() {
    const client = await this.sql.getOpenConnection();
    try { return (await client.query('SELECT * FROM payments.v_price_list_items')).rows; }
    finally { releaseIfNotInTransaction(client); }
  }
}

export class GetPayerSubscriptionQueryHandler implements IQueryHandler<C.GetPayerSubscriptionQuery, any | null> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(q: C.GetPayerSubscriptionQuery) {
    const client = await this.sql.getOpenConnection();
    try {
      const rows = (await client.query(
        `SELECT * FROM payments.subscription_details WHERE payer_id=$1 AND status='Active' ORDER BY expiration_date DESC LIMIT 1`,
        [q.payerId],
      )).rows;
      return rows[0] ?? null;
    } finally { releaseIfNotInTransaction(client); }
  }
}

export class GetMeetingFeesQueryHandler implements IQueryHandler<C.GetMeetingFeesQuery, any[]> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(q: C.GetMeetingFeesQuery) {
    const client = await this.sql.getOpenConnection();
    try { return (await client.query('SELECT * FROM payments.meeting_fees WHERE payer_id=$1', [q.payerId])).rows; }
    finally { releaseIfNotInTransaction(client); }
  }
}
