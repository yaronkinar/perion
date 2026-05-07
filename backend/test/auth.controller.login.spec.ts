import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JWT_COOKIE_NAME } from '../src/common/constants';
import type { LoginResult } from '../src/auth/auth.service';
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

const loginResult: LoginResult = {
  token: 'signed.jwt.value',
  user: sessionUser,
};

describe('AuthController.login', () => {
  let controller: AuthController;
  let authService: { loginWithPassword: jest.Mock };

  beforeEach(async () => {
    authService = {
      loginWithPassword: jest.fn().mockResolvedValue(loginResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get(AuthController);
  });

  function makeReq(): Request {
    return { session: {} } as unknown as Request;
  }

  function makeRes(): Response & { cookie: jest.Mock } {
    return {
      cookie: jest.fn(),
    } as unknown as Response & { cookie: jest.Mock };
  }

  it('seeds req.session.user so session-based guards recognize the JWT login', async () => {
    const req = makeReq();
    const res = makeRes();

    const result = await controller.login(
      { email: sessionUser.email, password: 'Password123!' },
      req,
      res,
    );

    expect(authService.loginWithPassword).toHaveBeenCalledWith(
      sessionUser.email,
      'Password123!',
    );
    expect(req.session.user).toEqual(sessionUser);
    expect(result).toBe(loginResult);
  });

  it('writes the JWT to an httpOnly cookie', async () => {
    const req = makeReq();
    const res = makeRes();

    await controller.login(
      { email: sessionUser.email, password: 'Password123!' },
      req,
      res,
    );

    expect(res.cookie).toHaveBeenCalledTimes(1);
    const [cookieName, cookieValue, options] = res.cookie.mock.calls[0];
    expect(cookieName).toBe(JWT_COOKIE_NAME);
    expect(cookieValue).toBe(loginResult.token);
    expect(options).toEqual(
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
    );
  });
});
