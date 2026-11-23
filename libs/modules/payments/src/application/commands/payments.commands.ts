import { CommandBase, CommandBaseWithResult, InternalCommandBase, QueryBase } from '@building-blocks/application';

export class BuySubscriptionCommand extends CommandBaseWithResult<string> {
  constructor(
    readonly payerId: string,
    readonly subscriptionPeriodCode: string,
    readonly countryCode: string,
  ) {
    super();
  }
}

export class MarkSubscriptionPaymentAsPaidCommand extends CommandBase {
  constructor(readonly paymentId: string) {
    super();
  }
}

export class CreatePayerCommand extends InternalCommandBase {
  constructor(
    id: string,
    readonly payerId: string,
    readonly login: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
  ) {
    super(id);
  }

  static fromJson(d: Record<string, unknown>): CreatePayerCommand {
    return new CreatePayerCommand(
      String(d.id),
      String(d.payerId),
      String(d.login),
      String(d.email),
      String(d.firstName),
      String(d.lastName),
    );
  }
}

export class CreateMeetingFeeCommand extends InternalCommandBase {
  constructor(
    id: string,
    readonly meetingFeeId: string,
    readonly payerId: string,
    readonly meetingId: string,
    readonly feeValue: number,
    readonly feeCurrency: string,
  ) {
    super(id);
  }

  static fromJson(d: Record<string, unknown>): CreateMeetingFeeCommand {
    return new CreateMeetingFeeCommand(
      String(d.id),
      String(d.meetingFeeId),
      String(d.payerId),
      String(d.meetingId),
      Number(d.feeValue),
      String(d.feeCurrency),
    );
  }
}

export class CreatePriceListItemCommand extends CommandBaseWithResult<string> {
  constructor(
    readonly subscriptionPeriodCode: string,
    readonly countryCode: string,
    readonly moneyValue: number,
    readonly moneyCurrency: string,
    readonly categoryCode: string,
  ) {
    super();
  }
}

export class GetPriceListItemsQuery extends QueryBase<any[]> {}
export class GetPayerSubscriptionQuery extends QueryBase<any | null> {
  constructor(readonly payerId: string) {
    super();
  }
}
export class GetMeetingFeesQuery extends QueryBase<any[]> {
  constructor(readonly payerId: string) {
    super();
  }
}
