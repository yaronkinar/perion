import {
  ForbiddenException,
  Injectable,
  type NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ERRORS, MESSAGES } from '../common/messages';
import type { PermissionAction } from './entities/permission.entity';

interface RoutePermissionRule {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: RegExp;
  permission: PermissionAction;
}

const USERS_ID_SEGMENT = '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

const ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
  { method: 'GET', path: /^\/api\/users\/?$/i, permission: 'view_users' },
  { method: 'POST', path: /^\/api\/users\/?$/i, permission: 'create_user' },
  {
    method: 'PUT',
    path: new RegExp(`^/api/users/${USERS_ID_SEGMENT}/?$`, 'i'),
    permission: 'edit_user',
  },
  {
    method: 'DELETE',
    path: new RegExp(`^/api/users/${USERS_ID_SEGMENT}/?$`, 'i'),
    permission: 'delete_user',
  },
  { method: 'GET', path: /^\/api\/roles\/?$/i, permission: 'view_roles' },
  {
    method: 'PUT',
    path: new RegExp(`^/api/roles/${USERS_ID_SEGMENT}/?$`, 'i'),
    permission: 'edit_roles',
  },
];

@Injectable()
export class PermissionsMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const required = this.resolveRequiredPermission(req);
    if (!required) {
      next();
      return;
    }

    const sessionUser = req.session?.user;
    if (!sessionUser) {
      throw new UnauthorizedException(MESSAGES.NOT_AUTHENTICATED);
    }

    if (!sessionUser.permissions.includes(required)) {
      throw new ForbiddenException(ERRORS.missingPermission(required));
    }

    next();
  }

  private resolveRequiredPermission(req: Request): PermissionAction | undefined {
    const method = req.method.toUpperCase();
    const requestPath = req.path;
    const originalUrlPath = req.originalUrl.split('?')[0];
    const fullPath =
      originalUrlPath && originalUrlPath !== '/' ? originalUrlPath : requestPath;

    const match = ROUTE_PERMISSION_RULES.find(
      (rule) => rule.method === method && rule.path.test(fullPath),
    );
    return match?.permission;
  }
}
