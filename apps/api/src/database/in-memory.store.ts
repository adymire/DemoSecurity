import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AuditRecord,
  IdentityProvider,
  IdentityRecord,
  InstallationRecord,
  OnboardingRecord,
  RiskSignalRecord,
  SubscriptionRecord,
  UsageRecord,
  UserRecord,
} from './repositories';

/**
 * In-memory repository used as the default MVP adapter.
 * It implements the SAME domain contract as the Prisma (postgres/sqlite)
 * and Mongoose (mongodb) adapters, so controllers stay driver-independent
 * (see docs/database.md). Swap with a real adapter per deployment.
 *
 * NOTE: data is process-local. Use mongodb/postgres/redis in any shared env.
 */
@Injectable()
export class InMemoryStore {
  users = new Map<string, UserRecord>();
  usersByEmail = new Map<string, string>();
  identities = new Map<string, IdentityRecord>(); // key: PROVIDER:providerUserId
  onboardings = new Map<string, OnboardingRecord>();
  riskSignals: RiskSignalRecord[] = [];
  subscriptions = new Map<string, SubscriptionRecord>();
  usage = new Map<string, UsageRecord>();
  audits: AuditRecord[] = [];
  installations = new Map<string, InstallationRecord>();
  announcements: { id: string; title: string; body: string; active: boolean; createdAt: Date }[] = [];

  now() {
    return new Date();
  }

  createUser(email: string, displayName?: string, avatarUrl?: string): UserRecord {
    const existing = this.usersByEmail.get(email.toLowerCase());
    if (existing) return this.users.get(existing)!;
    const user: UserRecord = {
      id: randomUUID(),
      email,
      displayName: displayName ?? null,
      avatarUrl: avatarUrl ?? null,
      status: 'ACTIVE',
      blockedUntil: null,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    this.users.set(user.id, user);
    this.usersByEmail.set(email.toLowerCase(), user.id);
    return user;
  }

  linkIdentity(userId: string, provider: IdentityProvider, providerUserId: string): IdentityRecord {
    const key = `${provider}:${providerUserId}`;
    const existing = this.identities.get(key);
    if (existing) return existing;
    const record: IdentityRecord = {
      id: randomUUID(),
      provider,
      providerUserId,
      userId,
      createdAt: this.now(),
    };
    this.identities.set(key, record);
    return record;
  }

  appendAudit(userId: string | null, type: string, metadata: Record<string, unknown> = {}): AuditRecord {
    const record: AuditRecord = {
      id: randomUUID(),
      userId,
      type,
      metadata,
      createdAt: this.now(),
    };
    this.audits.push(record);
    return record;
  }
}
