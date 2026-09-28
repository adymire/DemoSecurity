import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../database/in-memory.store';

@Injectable()
export class AuditService {
  constructor(private readonly store: InMemoryStore) {}

  log(userId: string | null, type: string, metadata: Record<string, unknown> = {}) {
    return this.store.appendAudit(userId, type, metadata);
  }

  list(limit = 50) {
    return this.store.audits.slice(-limit).reverse();
  }

  listForUser(userId: string, limit = 50) {
    return this.store.audits
      .filter((a) => a.userId === userId)
      .slice(-limit)
      .reverse();
  }
}
