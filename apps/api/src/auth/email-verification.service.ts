import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizeEmail, isDisposableDomain, scoreDomainTrust, DomainTrust } from '../common/utils/email';

export interface EmailVerdict {
  canonical: string;
  domain: string;
  wasAliased: boolean;
  trust: DomainTrust;
  disposable: boolean;
  /** Live MX check — null (unknown) until the DNS worker is wired. */
  mxValid: boolean | null;
  needsDomainAgeCheck: boolean;
  allowed: boolean;
  reason: string | null;
}

/**
 * Email verification pipeline, used by AuthService BEFORE any account is
 * created: normalize -> disposable block -> trust tier -> MX stub.
 * Medium-trust domains are allowed + challenged, never silently blocked.
 */
@Injectable()
export class EmailVerificationService {
  constructor(private readonly config: ConfigService) {}

  async verify(rawEmail: string): Promise<EmailVerdict> {
    const { canonical, domain, wasAliased } = normalizeEmail(rawEmail);
    if (!domain || !canonical.includes('@')) {
      return {
        canonical, domain, wasAliased, trust: 'blocked', disposable: false,
        mxValid: false, needsDomainAgeCheck: false, allowed: false, reason: 'malformed_email',
      };
    }
    const disposable = isDisposableDomain(domain);
    if (disposable) {
      return {
        canonical, domain, wasAliased, trust: 'blocked', disposable: true,
        mxValid: null, needsDomainAgeCheck: false, allowed: false, reason: 'disposable_domain',
      };
    }
    const { trust, needsDomainAgeCheck } = scoreDomainTrust(domain);
    const mxValid = await this.checkMxStub(domain);
    if (mxValid === false) {
      return {
        canonical, domain, wasAliased, trust, disposable: false,
        mxValid, needsDomainAgeCheck, allowed: false, reason: 'mx_missing',
      };
    }
    return {
      canonical, domain, wasAliased, trust, disposable: false,
      mxValid, needsDomainAgeCheck, allowed: true, reason: null,
    };
  }

  /** Adapter point: dns.resolveMx + SPF/DKIM lookup. Null = not configured. */
  private async checkMxStub(_domain: string): Promise<boolean | null> {
    void this.config.get<string>('FAKESEC_DISPOSABLE_LIST_URL', '');
    return null;
  }
}
