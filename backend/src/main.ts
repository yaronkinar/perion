import 'reflect-metadata';
import './auth/session.types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { AppModule } from './app.module';
import {
  API_PREFIX,
  DEFAULT_CORS_ORIGIN,
  DEFAULT_PORT,
  MIN_SECRET_LENGTH,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  isProduction,
} from './common/constants';
import { ERRORS, LOG_MESSAGES } from './common/messages';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

function readSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(ERRORS.sessionSecretRequired);
  }
  if (isProduction() && secret.length < MIN_SECRET_LENGTH) {
    throw new Error(ERRORS.sessionSecretRequired);
  }
  return secret;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.setGlobalPrefix(API_PREFIX);

  if (isProduction()) {
    app.set('trust proxy', 1);
  }

  const corsOrigin = process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.use(cookieParser());

  const sessionSecret = readSessionSecret();
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction(),
        maxAge: SESSION_MAX_AGE_MS,
      },
      name: SESSION_COOKIE_NAME,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(LOG_MESSAGES.backendListening(port));
}

void bootstrap();
