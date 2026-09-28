import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

export interface NetworkVerdict {
  /** The ONLY IP the server trusts — observed from the socket/proxy chain. */
  serverObservedIp: string | null;
  countryCode: string | null;
  vpnLikely: boolean;
  datacenterLikely: boolean;
  torLikely: boolean;
  reasons: string[];
  /** Soft action: flagged network => free credit paused + verify, never auto-block. */
  freeCreditEligible: boolean;
}

/**
 * Proxy/VPN/datacenter detection (server half of the network check).
 * Browsers cannot report WiFi-router/hardware/"browser IP" — the server
 * observes the public source IP itself and scores it. Set
 * FAKESEC_IP_INTEL_PROVIDER + FAKESEC_IP_INTEL_API_KEY for a live lookup
 * (MaxMind / IPQualityScore / AbuseIPDB); until then an offline stub runs
 * that errs toward allow + monitor, never toward block.
 */
@Injectable()
export class NetworkIntelService {
  constructor(private readonly config: ConfigService) {}

  extractServerIp(req: Request): string | null {
    const fwd = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
    const ip = fwd || req.ip || (req.socket as { remoteAddress?: string })?.remoteAddress || null;
    return ip && ip !== '::1' ? ip : ip;
  }

  async evaluate(serverIp: string | null): Promise<NetworkVerdict> {
    const base: NetworkVerdict = {
      serverObservedIp: serverIp, countryCode: null, vpnLikely: false,
      datacenterLikely: false, torLikely: false, reasons: [], freeCreditEligible: true,
    };
    if (!serverIp) return base;

    const provider = this.config.get<string>('FAKESEC_IP_INTEL_PROVIDER', '');
    const key = this.config.get<string>('FAKESEC_IP_INTEL_API_KEY', '');
    if (provider && key) {
      // TODO: live lookup here, map score -> flags. Soft-action mapping below stays.
      return base;
    }
    const lowered = serverIp.toLowerCase();
    if (lowered.includes('.onion') || lowered.startsWith('tor:')) {
      return { ...base, torLikely: true, reasons: ['tor_hint_stub'], freeCreditEligible: false };
    }
    return base;
  }
}
