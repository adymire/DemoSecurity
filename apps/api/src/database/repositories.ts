export type AccountStatus = 'ACTIVE' | 'RESTRICTED' | 'TEMPORARY_BLOCK' | 'PERMANENT_BLOCK';
export type IdentityProvider = 'GOOGLE' | 'GITHUB';

export interface UserRecord {
  id: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  status: AccountStatus;
  blockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IdentityRecord {
  id: string;
  provider: IdentityProvider;
  providerUserId: string;
  userId: string;
  createdAt: Date;
}

export interface OnboardingRecord {
  userId: string;
  completed: boolean;
  data: Record<string, unknown>;
  updatedAt: Date;
}

export interface RiskSignalRecord {
  id: string;
  userId: string;
  installation?: string | null;
  ipHash?: string | null;
  userAgentHash?: string | null;
  countryCode?: string | null;
  deviceKeyHash?: string | null;
  reasonCode?: string | null;
  score: number;
  createdAt: Date;
  expiresAt?: Date | null;
}

export interface SubscriptionRecord {
  userId: string;
  planId: string;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  status: string;
  currentPeriodEnd?: Date | null;
  updatedAt: Date;
}

export interface UsageRecord {
  userId: string;
  periodStart: Date;
  prompts: number;
  updatedAt: Date;
}

export interface AuditRecord {
  id: string;
  userId?: string | null;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface InstallationRecord {
  id: string;
  userId?: string | null;
  installationId: string;
  platform: string;
  appId: string;
  appVersion?: string | null;
  deviceRiskIdHash?: string | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
}
