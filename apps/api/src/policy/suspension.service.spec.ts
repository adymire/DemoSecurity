import { SuspensionService } from './suspension.service';
import { InMemoryStore } from '../database/in-memory.store';
import { AuditService } from '../audit/audit.service';

describe('SuspensionService ladder (soft -> severe -> permanent)', () => {
  const make = () => {
    const store = new InMemoryStore();
    const svc = new SuspensionService(store, new AuditService(store));
    return { store, svc };
  };

  it('RESTRICT_2D pauses free tier and auto-recovers after 48h', () => {
    const { store, svc } = make();
    const user = store.createUser('r@example.com');
    svc.applyRestrict2D(user.id, 'moderate');
    expect(svc.freeTierPaused(user.id)).toBe(true);
    user.blockedUntil = new Date(Date.now() - 1000);
    expect(svc.freeTierPaused(user.id)).toBe(false);
    expect(store.users.get(user.id)!.status).toBe('ACTIVE');
  });

  it('escalates moderate -> severe -> critical to permanent', () => {
    const { store, svc } = make();
    const user = store.createUser('e@example.com');
    expect(svc.escalate(user.id, 'e@example.com', null, 'moderate').tier).toBe('RESTRICT_2D');
    expect(svc.escalate(user.id, 'e@example.com', null, 'severe').tier).toBe('TEMPORARY_BLOCK');
    expect(svc.escalate(user.id, 'e@example.com', null, 'critical').tier).toBe('PERMANENT_BLOCK');
    expect(svc.isHardBanned('e@example.com', null)).toBe(true);
  });
});
