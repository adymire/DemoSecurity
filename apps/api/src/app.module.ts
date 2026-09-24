import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({
    NODE_ENV: Joi.string().default('development'), PORT: Joi.number().default(3000),
    DB_DRIVER: Joi.string().valid('mongodb', 'sqlite', 'postgres').default('mongodb'),
    MONGODB_URI: Joi.when('DB_DRIVER', { is: 'mongodb', then: Joi.string().required(), otherwise: Joi.string().optional() }),
    DATABASE_URL: Joi.when('DB_DRIVER', { is: 'postgres', then: Joi.string().required(), otherwise: Joi.string().optional() }),
    SQLITE_DATABASE_URL: Joi.string().default('file:./data/demosecurity.db'),
    SESSION_SECRET: Joi.string().min(32).required(), RISK_SIGNAL_PEPPER: Joi.string().min(32).required()
  }) }), DatabaseModule],
  controllers: [HealthController],
})
export class AppModule {}
