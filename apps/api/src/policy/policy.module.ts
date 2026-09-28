import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { PolicyService } from './policy.service';
import { SuspensionService } from './suspension.service';

@Module({
  imports: [DatabaseModule, AuditModule],
  providers: [PolicyService, SuspensionService],
  exports: [PolicyService, SuspensionService],
})
export class PolicyModule {}
