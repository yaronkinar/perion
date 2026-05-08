import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { SessionUser } from '../src/auth/session.types';
import { ERRORS, MESSAGES } from '../src/common/messages';
import type { PermissionAction } from '../src/permissions/entities/permission.entity';
import { PermissionsMiddleware } from '../src/permissions/permissions.middleware';

function makeReq(overrides: Record<string, unknown> = {}): Request {
  const base = {
    method: 'GET',
    path: '/',
    originalUrl: '/',
  };
  return { ...base, ...overrides } as unknown as Request;
}

describe('PermissionsMiddleware', () => {
  let middleware: PermissionsMiddleware;
  let next: NextFunction;
  const res = {} as Response;
  const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const makeSessionUser = (permissions: PermissionAction[]): SessionUser => ({
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    status: 'active',
    roleId: 'r1',
    roleName: 'Admin',
    permissions,
  });

  beforeEach(() => {
    middleware = new PermissionsMiddleware();
    next = jest.fn();
  });

  it('calls next when route has no permission rule', () => {
    const req = makeReq({ method: 'GET', path: '/health', originalUrl: '/health' });

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('throws Unauthorized when matching route requires auth but session user is missing', () => {
    const req = makeReq({
      method: 'GET',
      path: '/api/users',
      originalUrl: '/api/users',
    });

    expect(() => middleware.use(req, res, next)).toThrow(
      new UnauthorizedException(MESSAGES.NOT_AUTHENTICATED),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('throws Forbidden when session user lacks required permission', () => {
    const req = makeReq({
      method: 'DELETE',
      path: `/api/users/${userId}`,
      originalUrl: `/api/users/${userId}`,
      session: {
        user: makeSessionUser(['view_users']),
      },
    });

    expect(() => middleware.use(req, res, next)).toThrow(
      new ForbiddenException(ERRORS.missingPermission('delete_user')),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user has required permission for matched route', () => {
    const req = makeReq({
      method: 'PUT',
      path: `/api/roles/${userId}`,
      originalUrl: `/api/roles/${userId}`,
      session: {
        user: makeSessionUser(['edit_roles']),
      },
    });

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('matches permissions using originalUrl without query string', () => {
    const req = makeReq({
      method: 'POST',
      path: '/api/users',
      originalUrl: '/api/users?foo=bar',
      session: {
        user: makeSessionUser(['create_user']),
      },
    });

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
