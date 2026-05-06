import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ERRORS, MESSAGES } from '../common/messages';
import { PERMISSION_METADATA_KEY } from './permissions.decorator';
import type { PermissionAction } from './entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<
      PermissionAction | undefined
    >(PERMISSION_METADATA_KEY, [context.getHandler(), context.getClass()]);

    const request = context.switchToHttp().getRequest<Request>();
    const sessionUser = request.session?.user;

    if (!sessionUser) {
      throw new UnauthorizedException(MESSAGES.NOT_AUTHENTICATED);
    }

    // Default-deny: every guarded handler must declare its required permission
    // explicitly. Missing metadata is treated as a server-side mistake, never
    // as "anyone with a session may pass".
    if (!required) {
      throw new ForbiddenException(MESSAGES.MISSING_PERMISSION_METADATA);
    }

    if (!sessionUser.permissions.includes(required)) {
      throw new ForbiddenException(ERRORS.missingPermission(required));
    }

    return true;
  }
}
