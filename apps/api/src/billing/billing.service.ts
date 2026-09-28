import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { InMemoryStore } from '../database/in-memory.store';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class BillingService {
  private seenEvents = new Set<string>();

  constructor(
    private readonly store: InMemoryStore,
    private readonly config: ConfigService,
    private readonly audits: AuditService,
  ) {}

  createCheckout(userId: string, planId: string) {
    const provider = this.config.get<string>('PAYMENT_PROVIDER', 'stripe');
    // Real integration: create a hosted session with the provider here and
    // return its URL. The desktop app opens it in the DEFAULT BROWSER.
    const deepLink = this.config.get<string>('BILLING_RETURN_DEEPLINK', 'demosecurity://billing/complete');
    return {
      checkoutUrl: `https://checkout.${provider}.example/session/${userId}/${planId}`,
      planId,
      returnDeeplink: deepLink,
      note: 'App must refresh GET /billing/subscription after webhook; never trust redirect params.',
    };
  }

  subscription(userId: string) {
    return (
      this.store.subscriptions.get(userId) ?? {
        userId,
        planId: 'free',
        status: 'active',
        currentPeriodEnd: null,
        updatedAt: new Date(),
      }
    );
  }

  applyWebhook(signature: string | undefined, event: { eventId: string; userId: string; planId: string; status?: string }) {
    const secret = this.config.get<string>('PAYMENT_WEBHOOK_SECRET', '');
    if (!secret) throw new UnauthorizedException('Webhook secret not configured');
    if (!signature) throw new UnauthorizedException('Missing webhook signature');

    // HMAC verification (provider-specific header parsing belongs in an adapter)
    const expected = createHmac('sha256', secret).update(JSON.stringify(event)).digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b))
      throw new UnauthorizedException('Invalid webhook signature');

    // Idempotency: deduplicate retried deliveries
    if (this.seenEvents.has(event.eventId)) return { deduped: true, eventId: event.eventId };
    this.seenEvents.add(event.eventId);

    const sub = {
      userId: event.userId,
      planId: event.planId,
      providerCustomerId: null,
      providerSubscriptionId: event.eventId,
      status: event.status ?? 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      updatedAt: new Date(),
    };
    this.store.subscriptions.set(event.userId, sub);

    // Lifting plan restrictions happens ONLY here (transactionally in SQL adapters).
    const user = this.store.users.get(event.userId);
    if (user && user.status === 'RESTRICTED') {
      user.status = 'ACTIVE';
      user.updatedAt = new Date();
    }
    this.audits.log(event.userId, 'PAYMENT_UPDATED', { planId: event.planId, eventId: event.eventId });
    return { ok: true, subscription: sub };
  }
}
