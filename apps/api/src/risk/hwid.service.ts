import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { InMemoryStore } from '../database/in-memory.store';

/**
 * Hardware fingerprint — privacy-safe OPTIONAL risk signal.
 * Only the desktop app (OS permission + consent) sends a raw HWID bundle;
 * browsers never do. Server keeps HMAC(raw, pepper) only — raw serials are
 * never stored. Absent HWID never blocks; reused HWID is a strong signal.
 */
@Injectable()
export class HwidService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly config: ConfigService,
  ) {}

  hashRaw(rawHwid: string | null | undefined): string | null {
    if (!rawHwid || rawHwid.trim().length < 8) return null;
    const pepper = this.config.get<string>('RISK_SIGNAL_PEPPER', 'pepper');
    return createHmac('sha256', pepper).update(`hwid:${rawHwid.trim()}`).digest('hex');
  }

  accountsSharing(hwidHash: string | null): number {
    if (!hwidHash) return 0;
    return new Set(
      this.store.riskSignals.filter((s) => s.deviceKeyHash === hwidHash).map((s) => s.userId),
    ).size;
  }

  /** HMAC check for the HWID payload — mismatch means drop + offense, never trust. */
  verifySignature(rawHwid: string, signatureHex: string, installSecret: string): boolean {
    try {
      const expected = createHmac('sha256', installSecret).update(rawHwid).digest();
      const got = Buffer.from(signatureHex, 'hex');
      return got.length === expected.length && timingSafeEqual(got, expected);
    } catch {
      return false;
    }
  }
}
