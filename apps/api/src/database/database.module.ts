import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseConfig } from './database-config.service';
import { InMemoryStore } from './in-memory.store';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}), // secret resolved per-call from ConfigService (see guards)
  ],
  providers: [DatabaseConfig, InMemoryStore],
  exports: [DatabaseConfig, InMemoryStore, JwtModule],
})
export class DatabaseModule {}
