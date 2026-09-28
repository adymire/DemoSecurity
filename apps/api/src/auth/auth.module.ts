import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './email-verification.service';
import { RiskModule } from '../risk/risk.module';
import { PolicyModule } from '../policy/policy.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, RiskModule, PolicyModule],
  controllers: [AuthController],
  providers: [AuthService, EmailVerificationService],
  exports: [AuthService],
})
export class AuthModule {}
