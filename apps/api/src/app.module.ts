import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({
    NODE_ENV: Joi.string().default('development'), PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(), SESSION_SECRET: Joi.string().min(32).required()
  }) })],
  controllers: [HealthController],
})
export class AppModule {}
