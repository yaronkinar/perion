import { INestApplication } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { Test, TestingModule } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import type { SessionUser } from '../src/auth/session.types';

const sessionUser: SessionUser = {
  id: 'u-admin',
  name: 'Admin User',
  email: 'admin@test.com',
  status: 'active',
  roleId: 'role-admin',
  roleName: 'Admin',
  permissions: ['view_users', 'create_user'],
};

describe('Auth login rate limiting', () => {
  let app: INestApplication;
  const authService = {
    loginWithPassword: jest.fn().mockResolvedValue({
      token: 'signed.jwt.value',
      user: sessionUser,
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60_000,
            limit: 2,
          },
        ]),
      ],
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = module.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.session = {} as Request['session'];
      next();
    });
    await app.init();
  });

  beforeEach(() => {
    authService.loginWithPassword.mockClear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 429 after exceeding login attempts in the window', async () => {
    const payload = {
      email: 'admin@test.com',
      password: 'Password123!',
    };

    await request(app.getHttpServer()).post('/auth/login').send(payload).expect(200);
    await request(app.getHttpServer()).post('/auth/login').send(payload).expect(200);
    await request(app.getHttpServer()).post('/auth/login').send(payload).expect(429);

    expect(authService.loginWithPassword).toHaveBeenCalledTimes(2);
  });
});
