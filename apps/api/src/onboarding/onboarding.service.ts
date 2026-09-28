import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../database/in-memory.store';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly audits: AuditService,
  ) {}

  get(userId: string) {
    return (
      this.store.onboardings.get(userId) ?? {
        userId,
        completed: false,
        data: {},
        updatedAt: new Date(),
      }
    );
  }

  update(userId: string, patch: { completed?: boolean; data?: Record<string, unknown> }) {
    const prev = this.get(userId);
    const next = {
      userId,
      completed: patch.completed ?? prev.completed,
      data: { ...prev.data, ...(patch.data ?? {}) },
      updatedAt: new Date(),
    };
    this.store.onboardings.set(userId, next);
    this.audits.log(userId, 'ONBOARDING_UPDATED', { completed: next.completed });
    return next;
  }
}
