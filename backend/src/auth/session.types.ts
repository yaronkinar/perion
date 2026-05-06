import type { PermissionAction } from '../permissions/entities/permission.entity';
import type { RoleName } from '../roles/entities/role.entity';
import type { UserStatus } from '../users/entities/user.entity';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  roleId: string;
  roleName: RoleName;
  permissions: PermissionAction[];
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}
