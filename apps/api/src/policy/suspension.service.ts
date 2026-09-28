import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../database/in-memory.store';
import { AuditService } from '../audit/audit.service';

export type SuspensionTier = 'NONE' | 'RESTRICT_2D' | 'TEMPORARY_BLOCK' | 'PERMANENT_BLOCK';

export interface SuspensionState {
  tier: SuspensionTier;
  until: Date | null;
  reason: string | null;
  offenses: number;
}

/**
 * 3-tier suspension ladder (lives in PolicyModule — enforcement side of plans).
 *
 *  Moderate (VPN/email-swap/VM first-seen)
 *    -> RESTRICT_2D: status=RESTRICTED, free-tier credits paused 48h,
 *       main account stays usable. Auto-recovers on expiry.
 *  Severe (disposable spam, scripted velocity, tampered HWID payload)
 *    -> TEMPORARY_BLOCK 7–14 days. Appeal path required.
 *  Repeated / critical (VM-farm abuse, reverse-engineering, payment bypass)
 *    -> PERMANENT_BLOCK + HWID hash & canonical email on hard-ban list.
 */
@Injectable()
export class SuspensionService {
  private bannedHwid = new Set<string>();
  private bannedEmail = new Set<string>();

  constructor(
    private readonly store: InMemoryStore,
    private readonly audits: AuditService,
  ) {}

  offenses(userId: string): number {
    return this.store.riskSignals.filter(
      (s) => s.userId === userId && s.reasonCode === 'offense',
    ).length;
  }

  recordOffense(userId: string, kind: string): number {
    this.store.riskSignals.push({
      id: `off-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId, installation: null, ipHash: null, userAgentHash: null,
      countryCode: null, deviceKeyHash: null, reasonCode: 'offense',
      score: 0, createdAt: new Date(), expiresAt: null,
    });
    this.audits.log(userId, 'LOGIN_RISK', { action: 'offense_recorded', kind });
    return this.offenses(userId);
  }

  isHardBanned(canonicalEmail: string, hwidHash: string | null): boolean {
    return this.bannedEmail.has(canonicalEmail) || (!!hwidHash && this.bannedHwid.has(hwidHash));
  }

  state(userId: string): SuspensionState {
    const user = this.store.users.get(userId);
    if (!user) return { tier: 'NONE', until: null, reason: null, offenses: 0 };
    const offenses = this.offenses(userId);
    if (user.status === 'PERMANENT_BLOCK')
      return { tier: 'PERMANENT_BLOCK', until: null, reason: 'terms_violation', offenses };
    if (user.status === 'TEMPORARY_BLOCK')
      return { tier: 'TEMPORARY_BLOCK', until: user.blockedUntil ?? null, reason: 'cooldown', offenses };
    if (user.status === 'RESTRICTED')
      return { tier: 'RESTRICT_2D', until: user.blockedUntil ?? null, reason: 'recovery', offenses };
    return { tier: 'NONE', until: null, reason: null, offenses };
  }

  /** Free tier paused while RESTRICTED-with-future-clock (pro users unaffected). */
  freeTierPaused(userId: string): boolean {
    const user = this.store.users.get(userId);
    if (!user || user.status !== 'RESTRICTED') return false;
    if (!user.blockedUntil) return true;
    if (user.blockedUntil.getTime() < Date.now()) {
      user.status = 'ACTIVE';
      user.blockedUntil = null;
      user.updatedAt = new Date();
      return false;
    }
    return (this.store.subscriptions.get(userId)?.planId ?? 'free') === 'free';
  }

  applyRestrict2D(userId: string, reason: string): SuspensionState {
    const user = this.store.users.get(userId);
    if (!user) throw new NotFoundException('User not found');
    user.status = 'RESTRICTED';
    user.blockedUntil = new Date(Date.now() + 48 * 3600 * 1000);
    user.updatedAt = new Date();
    this.audits.log(userId, 'RESTRICTION_APPLIED', { tier: 'RESTRICT_2D', reason });
    return this.state(userId);
  }

  applyTemporaryBlock(userId: string, days: 7 | 14, reason: string): SuspensionState {
    const user = this.store.users.get(userId);
    if (!user) throw new NotFoundException('User not found');
    user.status = 'TEMPORARY_BLOCK';
    user.blockedUntil = new Date(Date.now() + days * 24 * 3600 * 1000);
    user.updatedAt = new Date();
    this.audits.log(userId, 'RESTRICTION_APPLIED', { tier: 'TEMPORARY_BLOCK', days, reason });
    return this.state(userId);
  }

  applyPermanentBlock(userId: string, canonicalEmail: string, hwidHash: string | null, reason: string): SuspensionState {
    const user = this.store.users.get(userId);
    if (!user) throw new NotFoundException('User not found');
    user.status = 'PERMANENT_BLOCK';
    user.blockedUntil = null;
    user.updatedAt = new Date();
    this.bannedEmail.add(canonicalEmail);
    if (hwidHash) this.bannedHwid.add(hwidHash);
    this.audits.log(userId, 'RESTRICTION_APPLIED', { tier: 'PERMANENT_BLOCK', reason });
    return this.state(userId);
  }

  /**
   * Ladder entry: 1st moderate -> RESTRICT_2D · severe/2nd -> TEMPORARY_BLOCK ·
   * critical/3rd -> PERMANENT_BLOCK.
   */
  escalate(userId: string, canonicalEmail: string, hwidHash: string | null, kind: 'moderate' | 'severe' | 'critical'): SuspensionState {
    const count = this.recordOffense(userId, kind);
    if (kind === 'critical' || count >= 3)
      return this.applyPermanentBlock(userId, canonicalEmail, hwidHash, kind);
    if (kind === 'severe' || count >= 2)
      return this.applyTemporaryBlock(userId, count >= 2 ? 14 : 7, kind);
    return this.applyRestrict2D(userId, kind);
  }
}
