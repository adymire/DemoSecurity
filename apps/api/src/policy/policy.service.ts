import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InMemoryStore } from '../database/in-memory.store';

/**
 * Server-side plan limits + usage enforcement (docs/integration.md, PAYMENTS_AND_PLANS.md).
 * Clients can NEVER unlock paid features — every prompt checks this service.
 */
@Injectable()
export class PolicyService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly config: ConfigService,
  ) {}

  planLimit(planId: string): number {
    if (planId === 'pro') return this.config.get<number>('PRO_PLAN_PROMPT_LIMIT', 2000);
    return this.config.get<number>('FREE_PLAN_PROMPT_LIMIT', 50);
  }

  usageFor(userId: string) {
    const existing = this.store.usage.get(userId);
    if (existing) return existing;
    const fresh = { userId, periodStart: new Date(), prompts: 0, updatedAt: new Date() };
    this.store.usage.set(userId, fresh);
    return fresh;
  }

  /** Returns { allowed, remaining } and increments when allowed. */
  consumePrompt(userId: string): { allowed: boolean; remaining: number; planId: string; reason?: string } {
    const user = this.store.users.get(userId);
    const sub = this.store.subscriptions.get(userId);
    const planId = sub?.planId ?? 'free';
    // RESTRICT_2D recovery clock: free tier paused 48h, main account stays usable.
    if (user?.status === 'RESTRICTED' && planId === 'free') {
      if (!user.blockedUntil || user.blockedUntil.getTime() > Date.now()) {
        return { allowed: false, remaining: this.remainingFor(userId, planId), planId, reason: 'free_paused_restricted' };
      }
      user.status = 'ACTIVE'; // auto-recover after 48h
      user.blockedUntil = null;
      user.updatedAt = new Date();
    }
    const limit = this.planLimit(planId);
    const usage = this.usageFor(userId);
    if (usage.prompts >= limit) return { allowed: false, remaining: 0, planId };
    usage.prompts += 1;
    usage.updatedAt = new Date();
    return { allowed: true, remaining: limit - usage.prompts, planId };
  }

  private remainingFor(userId: string, planId: string): number {
    return Math.max(0, this.planLimit(planId) - this.usageFor(userId).prompts);
  }

  accountBlocked(userId: string): { blocked: boolean; reason?: string } {
    const user = this.store.users.get(userId);
    if (!user) return { blocked: true, reason: 'unknown_user' };
    if (user.status === 'PERMANENT_BLOCK') return { blocked: true, reason: 'permanent_block' };
    if (user.status === 'TEMPORARY_BLOCK') {
      if (user.blockedUntil && user.blockedUntil.getTime() > Date.now())
        return { blocked: true, reason: 'temporary_block' };
      user.status = 'ACTIVE';
      user.blockedUntil = null;
      return { blocked: false };
    }
    if (user.status === 'RESTRICTED') return { blocked: false, reason: 'restricted' };
    return { blocked: false };
  }
}
