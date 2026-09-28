/**
 * Language-neutral contracts shared by every SDK adapter and the backend.
 * Keep this package dependency-free so Python/PHP/Go ports can mirror it.
 * Mirrors docs/fake-user-security-sdk-docs/API.md + DATA_MODEL.md.
 */

export type AccountStatus = 'ACTIVE' | 'RESTRICTED' | 'TEMPORARY_BLOCK' | 'PERMANENT_BLOCK';
export type IdentityProvider = 'GOOGLE' | 'GITHUB';
export type RiskDecision = 'allow' | 'challenge' | 'restrict' | 'temporary_block' | 'permanent_block';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type SecurityEventType = 'SIGNUP' | 'LOGIN' | 'PROMPT' | 'CHECKOUT' | 'ADMIN_ACTION';

export interface RegisterInstallationRequest {
  appId: string;
  platform: 'web' | 'desktop' | 'android' | 'flutter' | 'ios' | string;
  appVersion: string;
  installationId: string; // client-generated UUID, stable per install
}

export interface CreateSessionRequest {
  installationId: string;
  authProvider?: IdentityProvider | string;
}

export interface SecurityEventRequest {
  type: SecurityEventType | string;
  installationId: string;
  metadata?: Record<string, unknown>;
}

export interface RiskEvaluateRequest {
  userId: string;
  installationId?: string;
  action: 'signup' | 'login' | 'prompt' | 'checkout';
}

export interface RiskEvaluateResponse {
  decision: RiskDecision;
  riskLevel: RiskLevel;
  riskScore: number;
  reasons: string[];
  restriction: null | { type: string; expiresAt?: string | null };
}

export interface OnboardingPayload {
  completed?: boolean;
  data?: Record<string, unknown>;
}

export interface CheckoutRequest {
  planId: 'pro' | 'team' | string;
}

export interface BillingWebhookEvent {
  eventId: string;
  userId: string;
  planId: string;
  status?: string;
}

export interface RestrictionRequest {
  status: 'RESTRICTED' | 'TEMPORARY_BLOCK' | 'PERMANENT_BLOCK';
  reason?: string;
  blockedUntil?: string;
}

export const API_ROUTES = {
  health: 'GET /health',
  googleStart: 'GET /api/v1/auth/google',
  githubStart: 'GET /api/v1/auth/github',
  me: 'GET /api/v1/auth/me',
  onboarding: 'PUT /api/v1/onboarding',
  riskEvaluate: 'POST /api/v1/risk/evaluate',
  checkout: 'POST /api/v1/billing/checkout',
  webhook: 'POST /api/v1/billing/webhook',
  adminUsers: 'GET /api/v1/admin/users',
  promptsWs: 'WS /prompts :: message=prompt',
} as const;
