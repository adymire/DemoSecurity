import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { InMemoryStore } from '../database/in-memory.store';
import { hashSignal } from '../common/utils/hash.util';

export interface EvaluateInput {
  action: 'signup' | 'login' | 'prompt' | 'checkout';
  installationId?: string;
  deviceRiskId?: string;
}

export interface RiskEvaluation {
  decision: 'allow' | 'challenge' | 'restrict' | 'temporary_block' | 'permanent_block';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  reasons: string[];
  restriction: null | { type: string; expiresAt?: string | null };
}

/**
 * Weighted multi-signal risk engine (docs: RISK_ENGINE.md + POLICY_ENGINE.md).
 *
 * riskScore = identityRisk + deviceRisk + networkRisk + velocityRisk + behaviourRisk
 *
 * Hard rule enforced here: ONE signal (same IP / same device / same country)
 * is NEVER enough for a block — it only contributes weight.
 */
@Injectable()
export class RiskService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly config: ConfigService,
  ) {}

  async ingest(input: {
    userId: string;
    installation?: string | null;
    ipHash?: string | null;
    userAgentHash?: string | null;
    countryCode?: string | null;
    deviceKeyHash?: string | null;
    reasonCode?: string | null;
    score?: number;
  }) {
    const expiresAt = new Date(Date.now() + 90 * 24 * 3600 * 1000); // 90-day TTL
    const record = {
      id: randomUUID(),
      userId: input.userId,
      installation: input.installation ?? null,
      ipHash: input.ipHash ?? null,
      userAgentHash: input.userAgentHash ?? null,
      countryCode: input.countryCode ?? null,
      deviceKeyHash: input.deviceKeyHash ?? null,
      reasonCode: input.reasonCode ?? null,
      score: input.score ?? 0,
      createdAt: new Date(),
      expiresAt,
    };
    this.store.riskSignals.push(record);
    return record;
  }

  async evaluate(userId: string, input: EvaluateInput): Promise<RiskEvaluation> {
    const signals = this.store.riskSignals.filter((s) => s.userId === userId).slice(-50);
    const reasons: string[] = [];
    let identityRisk = 0;
    let deviceRisk = 0;
    let networkRisk = 0;
    let velocityRisk = 0;
    let behaviourRisk = 0;

    const user = this.store.users.get(userId);
    if (user) {
      const ageHrs = (Date.now() - user.createdAt.getTime()) / 3600000;
      if (ageHrs < 24 && (input.action === 'signup' || input.action === 'prompt')) {
        identityRisk += 12;
        reasons.push('new_account');
      }
    }

    // Device/installation reuse — signal only (weight capped, never decisive alone)
    if (input.deviceRiskId) {
      const pepper = this.config.get<string>('RISK_SIGNAL_PEPPER', 'pepper');
      const hashed = hashSignal(input.deviceRiskId, pepper);
      const linkedAccounts = new Set(
        this.store.riskSignals.filter((s) => s.deviceKeyHash && s.deviceKeyHash === hashed).map((s) => s.userId),
      );
      if (linkedAccounts.size >= 2) {
        deviceRisk += Math.min(10 + linkedAccounts.size * 4, 25);
        reasons.push('device_reuse_across_accounts');
      }
    }
    if (input.installationId) {
      const installs = this.store.installations.get(input.installationId);
      if (installs?.userId && installs.userId !== userId) {
        deviceRisk += 15;
        reasons.push('installation_shared_across_accounts');
      }
    }

    // Network concentration — signal only
    const ipCounts = new Map<string, number>();
    for (const s of this.store.riskSignals.slice(-500)) {
      if (s.ipHash) ipCounts.set(s.ipHash, (ipCounts.get(s.ipHash) ?? 0) + 1);
    }
    const myIps = signals.map((s) => s.ipHash).filter(Boolean) as string[];
    const crowded = myIps.some((ip) => (ipCounts.get(ip) ?? 0) >= 5);
    if (crowded) {
      networkRisk += 15;
      reasons.push('network_concentration');
    }

    // Velocity: many events in last 10 minutes
    const recent = signals.filter((s) => Date.now() - s.createdAt.getTime() < 10 * 60 * 1000);
    if (recent.length >= 20) {
      velocityRisk += 25;
      reasons.push('high_velocity_10m');
    } else if (recent.length >= 8) {
      velocityRisk += 12;
      reasons.push('elevated_velocity_10m');
    }

    // Behaviour: free-credit farming hint — repeated prompts with fresh accounts
    const usage = this.store.usage.get(userId);
    if (usage && usage.prompts > 40 && (this.store.subscriptions.get(userId)?.planId ?? 'free') === 'free') {
      behaviourRisk += 10;
      reasons.push('heavy_free_usage');
    }

    const riskScore = Math.min(
      100,
      identityRisk + deviceRisk + networkRisk + velocityRisk + behaviourRisk,
    );

    const level = riskScore >= 80 ? 'critical' : riskScore >= 55 ? 'high' : riskScore >= 25 ? 'medium' : 'low';
    // Policy mapping (POLICY_ENGINE.md): low→allow, medium→allow+monitoring,
    // high→challenge/restrict, critical→temporary_block. Permanent block is admin-only.
    const decision =
      level === 'critical'
        ? 'temporary_block'
        : level === 'high'
          ? 'challenge'
          : level === 'medium'
            ? 'allow'
            : 'allow';

    return {
      decision,
      riskLevel: level,
      riskScore,
      reasons,
      restriction: decision === 'temporary_block' ? { type: 'temporary_block', expiresAt: null } : null,
    };
  }
}
