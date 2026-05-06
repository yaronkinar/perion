import { SetMetadata } from '@nestjs/common';
import type { PermissionAction } from './entities/permission.entity';

export const PERMISSION_METADATA_KEY = 'required_permission';

export const RequirePermission = (action: PermissionAction): MethodDecorator =>
  SetMetadata(PERMISSION_METADATA_KEY, action);
