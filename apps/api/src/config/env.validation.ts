import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  PUBLIC_APP_URL: Joi.string().uri().default('http://localhost:3000'),

  DB_DRIVER: Joi.string().valid('mongodb', 'sqlite', 'postgres').default('mongodb'),
  MONGODB_URI: Joi.when('DB_DRIVER', {
    is: 'mongodb',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  DATABASE_URL: Joi.when('DB_DRIVER', {
    is: 'postgres',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  SQLITE_DATABASE_URL: Joi.string().default('file:./data/demosecurity.db'),
  REDIS_URL: Joi.string().uri().optional().allow(''),

  SESSION_SECRET: Joi.string().min(32).required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  RISK_SIGNAL_PEPPER: Joi.string().min(32).required(),

  GOOGLE_CLIENT_ID: Joi.string().allow(''),
  GOOGLE_CLIENT_SECRET: Joi.string().allow(''),
  GOOGLE_CALLBACK_URL: Joi.string().uri().allow(''),
  GITHUB_CLIENT_ID: Joi.string().allow(''),
  GITHUB_CLIENT_SECRET: Joi.string().allow(''),
  GITHUB_CALLBACK_URL: Joi.string().uri().allow(''),

  PAYMENT_PROVIDER: Joi.string().default('stripe'),
  PAYMENT_WEBHOOK_SECRET: Joi.string().allow(''),
  BILLING_RETURN_DEEPLINK: Joi.string().default('demosecurity://billing/complete'),
  FREE_PLAN_PROMPT_LIMIT: Joi.number().default(50),
  PRO_PLAN_PROMPT_LIMIT: Joi.number().default(2000),

  // Fake-user security adapters (stub until keys/URLs are set — never required to boot)
  FAKESEC_DISPOSABLE_LIST_URL: Joi.string().uri().allow(''),
  FAKESEC_IP_INTEL_PROVIDER: Joi.string().valid('', 'maxmind', 'ipqs', 'abuseipdb').default(''),
  FAKESEC_IP_INTEL_API_KEY: Joi.string().allow(''),
});
