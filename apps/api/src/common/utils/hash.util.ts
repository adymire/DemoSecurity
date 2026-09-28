import { createHash, createHmac, randomUUID } from 'crypto';

/** Hash a risk signal with the server-side pepper. Never store raw IPs/fingerprints. */
export function hashSignal(value: string | null | undefined, pepper: string): string | null {
  if (!value) return null;
  return createHmac('sha256', pepper).update(value).digest('hex');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Mask email for admin/list responses: a***@example.com style. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const head = local.slice(0, 1) || '*';
  return `${head}***@${domain}`;
}

/** Generic duplicate-account message — never leak the other account's email. */
export const DUPLICATE_ACCOUNT_MESSAGE = 'An account with these credentials already exists.';

export function requestId(): string {
  return randomUUID();
}
