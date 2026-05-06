import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { SessionUser } from '../src/auth/session.types';
import { PermissionsGuard } from '../src/permissions/permissions.guard';

function makeContext(req: Partial<Request>): ExecutionContext {
  const ctx = {
    switchToHttp: () => ({
      getRequest: <T>(): T => req as T,
      getResponse: <T>(): T => ({} as T),
      getNext: <T>(): T => ({} as T),
    }),
    getHandler: () => () => undefined,
    getClass: () => class Dummy {},
  };
  return ctx as unknown as ExecutionContext;
}

const sessionUser: SessionUser = {
  id: 'u1',
  name: 'Admin',
  email: 'admin@test.com',
  status: 'active',
  roleId: 'r-admin',
  roleName: 'Admin',
  permissions: ['view_users', 'create_user'],
};

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('throws Unauthorized when session is missing entirely', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue('view_users');
    const ctx = makeContext({} as unknown as Partial<Request>);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws Unauthorized when session.user is missing', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue('view_users');
    const ctx = makeContext({
      session: { user: undefined },
    } as unknown as Partial<Request>);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws Forbidden when handler has no @RequirePermission metadata (default-deny)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = makeContext({
      session: { user: sessionUser },
    } as unknown as Partial<Request>);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('returns true when user has the required permission', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue('view_users');
    const ctx = makeContext({
      session: { user: sessionUser },
    } as unknown as Partial<Request>);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws Forbidden when user lacks the required permission', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue('delete_user');
    const ctx = makeContext({
      session: { user: sessionUser },
    } as unknown as Partial<Request>);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
