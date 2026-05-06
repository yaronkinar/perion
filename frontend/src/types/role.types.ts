import type { PermissionAction } from './permission.types';

export interface Permission {
  id: string;
  name: PermissionAction;
}

export type RoleName = 'Admin' | 'Editor' | 'Viewer';

export interface Role {
  id: string;
  name: RoleName;
  permissions: Permission[];
}

export interface UpdateRoleDto {
  permissionIds: string[];
}
