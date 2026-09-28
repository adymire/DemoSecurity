import { RiskService } from './risk.service';
import { InMemoryStore } from '../database/in-memory.store';
import { ConfigService } from '@nestjs/config';

describe('RiskService (multi-signal, no single-signal block)', () => {
  const make = () => {
    const store = new InMemoryStore();
    const config = new ConfigService({ RISK_SIGNAL_PEPPER: 'test-pepper-12345678901234567890' });
    return { store, svc: new RiskService(store, config) };
  };

  it('allows a fresh user with no correlated signals', async () => {
    const { store, svc } = make();
    const user = store.createUser('a@example.com');
    const res = await svc.evaluate(user.id, { action: 'login' });
    expect(res.decision).toBe('allow');
    expect(res.riskLevel).toBe('low');
  });

  it('never blocks on device reuse alone — weight is capped', async () => {
    const { store, svc } = make();
    const u1 = store.createUser('u1@example.com');
    const u2 = store.createUser('u2@example.com');
    await svc.ingest({ userId: u1.id, deviceKeyHash: 'same-device' });
    await svc.ingest({ userId: u2.id, deviceKeyHash: 'same-device' });
    const res = await svc.evaluate(u2.id, { action: 'login' });
    // device reuse contributes, but a single signal must not reach critical/block
    expect(res.decision).not.toBe('temporary_block');
    expect(res.decision).not.toBe('permanent_block');
  });
});
