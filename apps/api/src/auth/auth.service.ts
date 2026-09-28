import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { InMemoryStore } from '../database/in-memory.store';
import { IdentityProvider } from '../database/repositories';
import { AuditService } from '../audit/audit.service';
import { RiskService } from '../risk/risk.service';
import { HwidService } from '../risk/hwid.service';
import { AntiVmService, VmFlags } from '../risk/anti-vm.service';
import { NetworkIntelService } from '../risk/network-intel.service';
import { SuspensionService } from '../policy/suspension.service';
import { EmailVerificationService, EmailVerdict } from './email-verification.service';
import { hashSignal, maskEmail } from '../common/utils/hash.util';
import { normalizeEmail } from '../common/utils/email';

export interface SignupCheckInput {
  email: string;
  rawHwid?: string | null;
  hwidSignature?: string | null;
  installSecret?: string | null;
  vmFlags?: VmFlags | null;
  installationId?: string | null;
}

export interface MergePopup {
  linked: boolean;
  canonicalMaskedEmail: string | null;
  canonicalUserId: string | null;
  title: string;
  message: string;
  actions: ('switch-account' | 'change-email')[];
  creditsUnchanged: true;
}

export interface SignupCheckResult {
  email: EmailVerdict;
  merge: MergePopup;
  vm: ReturnType<AntiVmService['evaluate']>;
  network: Awaited<ReturnType<NetworkIntelService['evaluate']>>;
  hwidHash: string | null;
  hwidTampered: boolean;
  freeCreditEligible: boolean;
  decision: 'allow' | 'challenge' | 'deny';
  reasons: string[];
}

/**
 * Canonical-account auth foundation with the anti fake-user gate built in.
 *
 * - One canonical user per person; provider identities LINK to it.
 * - Every signup runs signupCheck() FIRST: email normalize (plus-trick/dots
 *   collapse) -> disposable block -> hard-ban -> merge-popup -> HWID/VM/
 *   network soft-gates. Deny means no account is created at all.
 * - Same device/email found -> merge-popup (masked email, ONE account,
 *   ZERO credit movement) instead of a second free serving.
 * - Email-only auto-linking stays DISABLED; verified provider identity required.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audits: AuditService,
    private readonly risk: RiskService,
    private readonly emailVerify: EmailVerificationService,
    private readonly hwid: HwidService,
    private readonly antiVm: AntiVmService,
    private readonly network: NetworkIntelService,
    private readonly suspension: SuspensionService,
  ) {}

  googleAuthorizeUrl(): string {
    const id = this.config.get<string>('GOOGLE_CLIENT_ID', '');
    const cb = this.config.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:3000/api/v1/auth/google/callback');
    if (!id) return cb;
    const params = new URLSearchParams({
      client_id: id,
      redirect_uri: cb,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  githubAuthorizeUrl(): string {
    const id = this.config.get<string>('GITHUB_CLIENT_ID', '');
    const cb = this.config.get<string>('GITHUB_CALLBACK_URL', 'http://localhost:3000/api/v1/auth/github/callback');
    if (!id) return cb;
    const params = new URLSearchParams({
      client_id: id,
      redirect_uri: cb,
      scope: 'read:user user:email',
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async handleOAuthCallback(provider: IdentityProvider, code: string, req: Request) {
    if (!code) throw new UnauthorizedException('Missing OAuth code');
    const providerUserId = `${provider.toLowerCase()}:${code.slice(0, 12)}`;
    const email = `${providerUserId.replace(/[^a-z0-9]/gi, '')}@example.invalid`;
    return this.loginWithProvider(provider, providerUserId, email, undefined, req);
  }

  /**
   * Public pre-signup gate (also called internally before every account
   * creation). Blocking only for disposable email, hard-ban, or tampered
   * HWID payload; VM/VPN/medium-trust only affect free-credit eligibility.
   */
  async signupCheck(input: SignupCheckInput, req?: Request): Promise<SignupCheckResult> {
    const reasons: string[] = [];
    const email = await this.emailVerify.verify(input.email);

    const hwidHash = this.hwid.hashRaw(input.rawHwid);
    let hwidTampered = false;
    if (input.rawHwid && input.hwidSignature && input.installSecret) {
      hwidTampered = !this.hwid.verifySignature(input.rawHwid, input.hwidSignature, input.installSecret);
      if (hwidTampered) reasons.push('hwid_signature_mismatch');
    }

    const serverIp = req ? this.network.extractServerIp(req) : null;
    const net = await this.network.evaluate(serverIp);
    const vm = this.antiVm.evaluate(input.vmFlags ?? null);
    const merge = this.mergeLookup(email.canonical, hwidHash);
    if (merge.linked) reasons.push('device_already_linked');

    if (!email.allowed) {
      reasons.push(email.reason ?? 'email_rejected');
      return this.gate(email, merge, vm, net, hwidHash, hwidTampered, false, 'deny', reasons);
    }
    if (this.suspension.isHardBanned(email.canonical, hwidHash)) {
      reasons.push('hard_banned');
      return this.gate(email, merge, vm, net, hwidHash, hwidTampered, false, 'deny', reasons);
    }
    if (hwidTampered) {
      reasons.push('tampered_payload');
      return this.gate(email, merge, vm, net, hwidHash, hwidTampered, false, 'deny', reasons);
    }

    let eligible = true;
    let decision: SignupCheckResult['decision'] = 'allow';
    if (!vm.freeCreditEligible) {
      eligible = false;
      decision = 'challenge';
      reasons.push('vm_no_free_credit');
    }
    if (!net.freeCreditEligible) {
      eligible = false;
      decision = 'challenge';
      reasons.push('network_verify_required');
    }
    if (email.trust === 'medium' && email.needsDomainAgeCheck) {
      decision = 'challenge';
      reasons.push('domain_age_check');
    }
    if (merge.linked) {
      eligible = false;
      if (decision === 'allow') decision = 'challenge';
    }
    return this.gate(email, merge, vm, net, hwidHash, hwidTampered, eligible, decision, reasons);
  }

  /** Banner/state for the UI: suspension tier + free-credit pause. */
  securityStatus(userId: string) {
    return {
      ...this.suspension.state(userId),
      freeTierPaused: this.suspension.freeTierPaused(userId),
    };
  }

  async loginWithEmail(email: string, displayName?: string, req?: Request) {
    const gate = await this.signupCheck({ email }, req);
    if (gate.decision === 'deny') {
      throw new UnauthorizedException(`Signup rejected: ${gate.reasons.join(', ')}`);
    }
    const user = this.store.createUser(gate.email.canonical, displayName);
    this.audits.log(user.id, 'ACCOUNT_CREATED', { method: 'email-dev' });
    await this.bindDevice(user.id, gate.hwidHash, req);
    return { ...this.sessionFor(user.id, user.email), isNew: true, security: gate };
  }

  async loginWithProvider(
    provider: IdentityProvider,
    providerUserId: string,
    email: string,
    displayName?: string,
    req?: Request,
  ) {
    const key = `${provider}:${providerUserId}`;
    const existingIdentity = this.store.identities.get(key);
    let user = existingIdentity ? this.store.users.get(existingIdentity.userId)! : undefined;

    if (!user) {
      const gate = await this.signupCheck({ email }, req);
      if (gate.decision === 'deny') {
        throw new UnauthorizedException(`Signup rejected: ${gate.reasons.join(', ')}`);
      }
      if (gate.merge.linked && gate.merge.canonicalUserId) {
        const canonical = this.store.users.get(gate.merge.canonicalUserId);
        if (canonical) {
          this.store.linkIdentity(canonical.id, provider, providerUserId);
          this.audits.log(canonical.id, 'PROVIDER_LINKED', { provider, via: 'merge_popup' });
          if (req) await this.bindDevice(canonical.id, gate.hwidHash, req);
          const evaluation = await this.risk.evaluate(canonical.id, { action: 'login' });
          return { ...this.sessionFor(canonical.id, canonical.email), risk: evaluation, merge: gate.merge };
        }
      }
      user = this.store.createUser(gate.email.canonical, displayName);
      this.store.linkIdentity(user.id, provider, providerUserId);
      this.audits.log(user.id, 'ACCOUNT_CREATED', { provider });
      this.audits.log(user.id, 'PROVIDER_LINKED', { provider });
      await this.bindDevice(user.id, gate.hwidHash, req);
    }

    if (req) await this.recordLoginSignal(user.id, req);

    const evaluation = await this.risk.evaluate(user.id, {
      action: 'login',
      installationId: (req?.body as Record<string, string> | undefined)?.installationId,
    });

    return { ...this.sessionFor(user.id, user.email), risk: evaluation };
  }

  profile(userId: string) {
    const user = this.store.users.get(userId);
    if (!user) throw new UnauthorizedException('Unknown user');
    const identities = [...this.store.identities.values()].filter((i) => i.userId === userId);
    const onboarding = this.store.onboardings.get(userId) ?? null;
    const subscription = this.store.subscriptions.get(userId) ?? null;
    return { user, identities, onboarding, subscription };
  }

  /** Same-device merge-popup: canonical-email match first, HWID match second. */
  private mergeLookup(canonicalEmail: string, hwidHash: string | null, currentUserId?: string): MergePopup {
    const none: MergePopup = {
      linked: false, canonicalMaskedEmail: null, canonicalUserId: null,
      title: 'Welcome', message: 'New device registered to your account.',
      actions: [], creditsUnchanged: true,
    };
    const byEmail = [...this.store.users.values()].find((u) => {
      if (currentUserId && u.id === currentUserId) return false;
      return normalizeEmail(u.email).canonical === canonicalEmail;
    });
    if (byEmail) return this.popup(byEmail.id, byEmail.email);
    if (hwidHash) {
      const sharer = this.store.riskSignals.find(
        (s) => s.deviceKeyHash === hwidHash && s.userId !== currentUserId,
      );
      if (sharer) {
        const owner = this.store.users.get(sharer.userId);
        if (owner) return this.popup(owner.id, owner.email);
      }
    }
    return none;
  }

  private popup(userId: string, email: string): MergePopup {
    const masked = maskEmail(email);
    return {
      linked: true,
      canonicalMaskedEmail: masked,
      canonicalUserId: userId,
      title: 'Device already linked',
      message: `This device is already linked to ${masked}. Credits merged — your Gmail can be changed, but the account stays one.`,
      actions: ['switch-account', 'change-email'],
      creditsUnchanged: true,
    };
  }

  private async bindDevice(userId: string, hwidHash: string | null, req?: Request, installationId?: string | null): Promise<void> {
    if (!hwidHash && !req) return;
    const pepper = this.config.get<string>('RISK_SIGNAL_PEPPER', 'pepper');
    await this.risk.ingest({
      userId,
      installation: installationId ?? null,
      ipHash: req ? hashSignal(this.network.extractServerIp(req), pepper) : null,
      userAgentHash: req ? hashSignal(req.headers['user-agent'] ?? null, pepper) : null,
      deviceKeyHash: hwidHash,
      reasonCode: 'device_bind',
    });
    this.audits.log(userId, 'LOGIN_RISK', { action: 'device_bound', installationId: installationId ?? null });
  }

  private gate(
    email: SignupCheckResult['email'], merge: MergePopup,
    vm: SignupCheckResult['vm'], net: SignupCheckResult['network'],
    hwidHash: string | null, hwidTampered: boolean,
    freeCreditEligible: boolean, decision: SignupCheckResult['decision'], reasons: string[],
  ): SignupCheckResult {
    return { email, merge, vm, network: net, hwidHash, hwidTampered, freeCreditEligible, decision, reasons };
  }

  private sessionFor(userId: string, email: string) {
    const accessToken = this.jwt.sign({ sub: userId, email }, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m') as never,
    });
    return { accessToken, tokenType: 'Bearer', userId };
  }

  private async recordLoginSignal(userId: string, req: Request) {
    const pepper = this.config.getOrThrow<string>('RISK_SIGNAL_PEPPER');
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip;
    await this.risk.ingest({
      userId,
      ipHash: hashSignal(ip ?? null, pepper),
      userAgentHash: hashSignal(req.headers['user-agent'] ?? null, pepper),
      countryCode: undefined,
    });
  }
}
