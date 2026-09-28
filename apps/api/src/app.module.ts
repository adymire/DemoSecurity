import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { RiskModule } from './risk/risk.module';
import { PolicyModule } from './policy/policy.module';
import { BillingModule } from './billing/billing.module';
import { AdminModule } from './admin/admin.module';
import { PromptsModule } from './prompts/prompts.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    DatabaseModule,
    AuditModule,
    AuthModule,
    UsersModule,
    OnboardingModule,
    RiskModule,
    PolicyModule,
    BillingModule,
    AdminModule,
    PromptsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
