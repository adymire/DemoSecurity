import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class CheckoutDto {
  @IsIn(['pro', 'team'])
  planId!: string;
}

class WebhookDto {
  @IsString()
  eventId!: string;

  @IsString()
  userId!: string;

  @IsString()
  planId!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  /** Returns a hosted checkout URL; opens in default browser for desktop apps. */
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@CurrentUser() user: { sub: string }, @Body() dto: CheckoutDto) {
    return this.billing.createCheckout(user.sub, dto.planId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  subscription(@CurrentUser() user: { sub: string }) {
    return this.billing.subscription(user.sub);
  }

  /**
   * Provider webhook — signature required, idempotent.
   * NEVER trust ?paid=true or a client flag (docs PAYMENTS_AND_PLANS.md).
   */
  @Post('webhook')
  webhook(
    @Headers('x-payment-signature') signature: string,
    @Body() dto: WebhookDto,
  ) {
    return this.billing.applyWebhook(signature, dto);
  }
}
