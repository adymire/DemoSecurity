import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InMemoryStore } from '../database/in-memory.store';
import { AuditService } from '../audit/audit.service';
import { maskEmail } from '../common/utils/hash.util';

@Injectable()
export class AdminService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly audits: AuditService,
  ) {}

  listUsers(page = 1, limit = 20) {
    const all = [...this.store.users.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const total = all.length;
    const items = all.slice((page - 1) * limit, page * limit).map((u) => ({
      id: u.id,
      maskedEmail: maskEmail(u.email),
      displayName: u.displayName,
      status: u.status,
      blockedUntil: u.blockedUntil,
      createdAt: u.createdAt,
      planId: this.store.subscriptions.get(u.id)?.planId ?? 'free',
      onboardingCompleted: this.store.onboardings.get(u.id)?.completed ?? false,
    }));
    return { page, limit, total, items };
  }

  userDetail(id: string) {
    const user = this.store.users.get(id);
    if (!user) throw new NotFoundException('User not found');
    return {
      ...user,
      maskedEmail: maskEmail(user.email),
      identities: [...this.store.identities.values()].filter((i) => i.userId === id),
      onboarding: this.store.onboardings.get(id) ?? null,
      subscription: this.store.subscriptions.get(id) ?? null,
      usage: this.store.usage.get(id) ?? null,
      riskSignals: this.store.riskSignals.filter((s) => s.userId === id).slice(-20),
      auditEvents: this.audits.listForUser(id, 20),
    };
  }

  recentEvents(limit = 50) {
    return this.audits.list(limit);
  }

  applyRestriction(
    userId: string,
    dto: { status: 'RESTRICTED' | 'TEMPORARY_BLOCK' | 'PERMANENT_BLOCK'; reason?: string; blockedUntil?: string },
    adminId: string,
  ) {
    const user = this.store.users.get(userId);
    if (!user) throw new NotFoundException('User not found');
    const before = user.status;
    user.status = dto.status;
    user.blockedUntil = dto.blockedUntil ? new Date(dto.blockedUntil) : dto.status === 'TEMPORARY_BLOCK' ? new Date(Date.now() + 48 * 3600 * 1000) : null;
    user.updatedAt = new Date();
    this.audits.log(userId, 'RESTRICTION_APPLIED', {
      before,
      after: user.status,
      reason: dto.reason ?? null,
      by: adminId,
    });
    return user;
  }

  removeRestriction(userId: string, adminId: string) {
    const user = this.store.users.get(userId);
    if (!user) throw new NotFoundException('User not found');
    const before = user.status;
    user.status = 'ACTIVE';
    user.blockedUntil = null;
    user.updatedAt = new Date();
    this.audits.log(userId, 'RESTRICTION_REMOVED', { before, after: 'ACTIVE', by: adminId });
    return user;
  }

  announce(title: string, body: string) {
    const item = { id: randomUUID(), title, body, active: true, createdAt: new Date() };
    this.store.announcements.push(item);
    this.audits.log(null, 'ADMIN_ACTION', { action: 'announcement_created', id: item.id });
    return item;
  }

  announcements() {
    return [...this.store.announcements].reverse();
  }
}
