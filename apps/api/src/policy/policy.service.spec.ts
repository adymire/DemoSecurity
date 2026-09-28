import { PolicyService } from './policy.service';
import { InMemoryStore } from '../database/in-memory.store';
import { ConfigService } from '@nestjs/config';

describe('PolicyService (server-side plan enforcement)', () => {
  it('blocks prompts after free limit and allows after upgrade', () => {
    const store = new InMemoryStore();
    const config = new ConfigService({ FREE_PLAN_PROMPT_LIMIT: 2, PRO_PLAN_PROMPT_LIMIT: 100 });
    const policy = new PolicyService(store, config);
    const user = store.createUser('p@example.com');

    expect(policy.consumePrompt(user.id).allowed).toBe(true);
    expect(policy.consumePrompt(user.id).allowed).toBe(true);
    expect(policy.consumePrompt(user.id).allowed).toBe(false);

    store.subscriptions.set(user.id, {
      userId: user.id,
      planId: 'pro',
      status: 'active',
      providerCustomerId: null,
      providerSubscriptionId: null,
      currentPeriodEnd: null,
      updatedAt: new Date(),
    });
    expect(policy.consumePrompt(user.id).allowed).toBe(true);
  });
});
