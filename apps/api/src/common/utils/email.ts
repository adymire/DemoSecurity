/**
 * Email identity helpers — part of the auth pipeline (anti fake-user).
 *
 * 1. normalizeEmail(): Gmail plus-trick / dots collapse.
 *    user+test1@gmail.com -> user@gmail.com
 *    u.s.e.r@gmail.com    -> user@gmail.com
 *    DB primary key is ALWAYS the canonical address.
 * 2. Disposable-domain blocklist (starter set; production syncs the full
 *    open-source list daily via FAKESEC_DISPOSABLE_LIST_URL).
 * 3. Domain trust tiers: high (consumer providers) / medium (corporate,
 *    needs MX + domain-age check) / blocked (throwaway).
 */

export interface NormalizedEmail {
  canonical: string;
  local: string;
  domain: string;
  wasAliased: boolean;
}

export type DomainTrust = 'high' | 'medium' | 'blocked';

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

const HIGH_TRUST = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com',
  'yahoo.com', 'icloud.com', 'proton.me', 'protonmail.com',
]);

const STARTER_DISPOSABLE = [
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
  'throwawaymail.com', 'fakemail.net', 'trashmail.com', 'yopmail.com',
  'getnada.com', 'mohmal.com', 'temp-mail.org', 'dispostable.com',
  'sharklasers.com', 'grr.la', 'guerrillamailblock.com', 'pokemail.net',
  'spam4.me', 'bccto.me', 'maildrop.cc', 'harakirimail.com', 'mintemail.com',
  'mailnesia.com', 'incognitomail.com', 'deadaddress.com', 'mytrashmail.com',
  'tempinbox.com', 'mailcatch.com', 'filzmail.com', 'reclaimmail.com',
];

export const DISPOSABLE_DOMAINS = new Set(
  STARTER_DISPOSABLE.map((d) => d.trim().toLowerCase()).filter(Boolean),
);

export function normalizeEmail(input: string): NormalizedEmail {
  const trimmed = input.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at <= 0 || at === trimmed.length - 1) {
    return { canonical: trimmed, local: trimmed, domain: '', wasAliased: false };
  }
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  let wasAliased = false;

  const plus = local.indexOf('+');
  if (plus >= 0) {
    local = local.slice(0, plus);
    wasAliased = true;
  }
  if (GMAIL_DOMAINS.has(domain)) {
    const dotted = local.includes('.');
    local = local.replace(/\./g, '');
    if (dotted) wasAliased = true;
  }
  return { canonical: `${local}@${domain}`, local, domain, wasAliased };
}

export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.trim().toLowerCase());
}

export function scoreDomainTrust(domain: string): { trust: DomainTrust; needsDomainAgeCheck: boolean } {
  const d = domain.trim().toLowerCase();
  if (!d) return { trust: 'blocked', needsDomainAgeCheck: false };
  if (isDisposableDomain(d)) return { trust: 'blocked', needsDomainAgeCheck: false };
  if (HIGH_TRUST.has(d)) return { trust: 'high', needsDomainAgeCheck: false };
  return { trust: 'medium', needsDomainAgeCheck: true };
}
