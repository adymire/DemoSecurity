import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PolicyService } from '../policy/policy.service';
import { AuditService } from '../audit/audit.service';

type WsServer = { emit: (...args: never[]) => void };
type WsSocket = {
  handshake: { auth?: Record<string, unknown>; query?: Record<string, unknown> };
  emit: (...args: never[]) => void;
};

/**
 * Secure desktop→backend prompt gateway.
 *
 * Flow: [Desktop App] → prompt → [local brain] → WebSocket (short-lived JWT)
 *       → [Backend: account + plan + rate checks] → [LLM worker]
 *
 * Loop engineering: the client keeps ONE socket open; each prompt result
 * streams back on the same connection and the frontend renders it.
 * The server NEVER trusts client plan/payment flags.
 */
@WebSocketGateway({ path: '/prompts', cors: { origin: true, credentials: true } })
export class PromptsGateway {
  @WebSocketServer()
  server!: WsServer;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly policy: PolicyService,
    private readonly audits: AuditService,
  ) {}

  private async userIdFor(client: WsSocket): Promise<string> {
    const token = (client.handshake.auth?.['token'] as string) ?? (client.handshake.query?.['token'] as string);
    if (!token) throw new WsException('Missing auth token');
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
      return payload.sub as string;
    } catch {
      throw new WsException('Invalid or expired token');
    }
  }

  @SubscribeMessage('prompt')
  async onPrompt(@ConnectedSocket() client: WsSocket, @MessageBody() body: { text?: string }) {
    const userId = await this.userIdFor(client);
    const blocked = this.policy.accountBlocked(userId);
    if (blocked.blocked) {
      this.audits.log(userId, 'LOGIN_RISK', { action: 'prompt_blocked', reason: blocked.reason });
      throw new WsException(`Account blocked: ${blocked.reason}`);
    }
    const quota = this.policy.consumePrompt(userId);
    if (!quota.allowed) {
      throw new WsException(`Plan limit reached (${quota.planId}). Upgrade via hosted checkout.`);
    }
    const text = (body?.text ?? '').toString().slice(0, 8000);
    if (!text.trim()) throw new WsException('Empty prompt');

    // MVP echo + accounting. Production: dispatch to LLM worker/queue here,
    // stream tokens back with client.emit('prompt:token', ...).
    this.audits.log(userId, 'LOGIN_RISK', { action: 'prompt_accepted', planId: quota.planId });
    return { ok: true, remaining: quota.remaining, planId: quota.planId, echo: text };
  }
}
