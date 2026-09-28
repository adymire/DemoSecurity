import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  // Security headers (docs/security.md: every endpoint behind TLS + headers)
  app.use(helmet());

  // CORS: lock down via env in production; permissive only for local dev
  const config = app.get(ConfigService);
  const nodeEnv = config.get<string>('NODE_ENV', 'development');
  const publicUrl = config.get<string>('PUBLIC_APP_URL', 'http://localhost:3000');
  app.enableCors({
    origin: nodeEnv === 'production' ? [publicUrl] : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Prefix keeps SDK contract stable: /api/v1 (see packages/contracts + docs API.md)
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'api-json', 'api-docs'] });

  const swagger = new DocumentBuilder()
    .setTitle('DemoSecurity API')
    .setDescription(
      'Platform-agnostic security foundation: OAuth linking, onboarding, risk/policy, billing webhooks, admin, prompt gateway.',
    )
    .setVersion('0.2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api-docs', app, document);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`demosecurity-api listening on :${port} (${nodeEnv}) driver=${config.get('DB_DRIVER')}`);
}
bootstrap();
