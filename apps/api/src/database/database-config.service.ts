import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type DatabaseDriver = 'mongodb' | 'sqlite' | 'postgres';

@Injectable()
export class DatabaseConfig implements OnModuleDestroy {
  readonly driver: DatabaseDriver;

  constructor(private readonly config: ConfigService) {
    const driver = config.get<DatabaseDriver>('DB_DRIVER', 'mongodb');
    if (!['mongodb', 'sqlite', 'postgres'].includes(driver)) {
      throw new Error('DB_DRIVER must be mongodb, sqlite, or postgres');
    }
    this.driver = driver;
  }

  get uri(): string {
    if (this.driver === 'mongodb') return this.config.getOrThrow<string>('MONGODB_URI');
    if (this.driver === 'sqlite') return this.config.get<string>('SQLITE_DATABASE_URL', 'file:./data/demosecurity.db');
    return this.config.getOrThrow<string>('DATABASE_URL');
  }

  onModuleDestroy() { /* adapter-owned clients close in their own lifecycle */ }
}
