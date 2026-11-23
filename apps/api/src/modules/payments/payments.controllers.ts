import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  BuySubscriptionCommand,
  CreatePriceListItemCommand,
  GetMeetingFeesQuery,
  GetPayerSubscriptionQuery,
  GetPriceListItemsQuery,
  IPaymentsModule,
  MarkSubscriptionPaymentAsPaidCommand,
} from '@modules/payments';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtPayload } from '../../auth/jwt.strategy';
import { HasPermission } from '../../auth/permissions.decorator';
import { PaymentsPermissions } from '../../auth/permissions';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { PAYMENTS_MODULE } from '../tokens';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller()
export class PaymentsControllers {
  constructor(@Inject(PAYMENTS_MODULE) private readonly payments: IPaymentsModule) {}

  @Post('api/payments/subscriptions')
  @HasPermission(PaymentsPermissions.BuySubscription)
  async buy(@Body() body: Record<string, string>, @CurrentUser() user: JwtPayload) {
    const paymentId = await this.payments.executeCommand(
      new BuySubscriptionCommand(user.sub, body.subscriptionPeriodCode, body.countryCode),
    );
    return { paymentId };
  }

  @Put('api/payments/subscriptionPayments/:paymentId/paid')
  @HasPermission(PaymentsPermissions.RegisterPayment)
  async markPaid(@Param('paymentId') paymentId: string) {
    await this.payments.executeCommand(new MarkSubscriptionPaymentAsPaidCommand(paymentId));
    return { status: 'paid' };
  }

  @Get('api/payments/subscriptions/my')
  @HasPermission(PaymentsPermissions.GetAuthenticatedPayerSubscription)
  mySubscription(@CurrentUser() user: JwtPayload) {
    return this.payments.executeQuery(new GetPayerSubscriptionQuery(user.sub));
  }

  @Get('api/payments/priceListItems')
  @HasPermission(PaymentsPermissions.GetPriceListItems)
  priceList() {
    return this.payments.executeQuery(new GetPriceListItemsQuery());
  }

  @Post('api/payments/priceListItems')
  @HasPermission(PaymentsPermissions.CreatePriceListItem)
  async createPrice(@Body() body: Record<string, string | number>) {
    const id = await this.payments.executeCommand(
      new CreatePriceListItemCommand(
        String(body.subscriptionPeriodCode),
        String(body.countryCode),
        Number(body.moneyValue),
        String(body.moneyCurrency),
        String(body.categoryCode ?? 'New'),
      ),
    );
    return { id };
  }

  @Get('api/payments/meetingFees')
  @HasPermission(PaymentsPermissions.GetMeetingFees)
  meetingFees(@CurrentUser() user: JwtPayload) {
    return this.payments.executeQuery(new GetMeetingFeesQuery(user.sub));
  }
}
