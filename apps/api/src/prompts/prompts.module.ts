import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { PolicyModule } from '../policy/policy.module';
import { PromptsGateway } from './prompts.gateway';

@Module({
  imports: [DatabaseModule, AuditModule, PolicyModule],
  providers: [PromptsGateway],
  exports: [PromptsGateway],
})
export class PromptsModule {}
