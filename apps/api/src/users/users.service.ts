import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../database/in-memory.store';
import { maskEmail } from '../common/utils/hash.util';

@Injectable()
export class UsersService {
  constructor(private readonly store: InMemoryStore) {}

  profile(userId: string) {
    const user = this.store.users.get(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      maskedEmail: maskEmail(user.email),
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      blockedUntil: user.blockedUntil,
      onboarding: this.store.onboardings.get(userId) ?? null,
      subscription: this.store.subscriptions.get(userId) ?? { planId: 'free', status: 'active' },
      usage: this.store.usage.get(userId) ?? null,
    };
  }
}
