import type { PermissionAction } from './permission.types';
import type { Role } from './role.types';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role?: Role;
}

export interface UserWithPermissions extends User {
  permissions: PermissionAction[];
}

export interface CreateUserDto {
  name: string;
  email: string;
  status: UserStatus;
  roleId: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  status?: UserStatus;
  roleId?: string;
}

export interface PublicUserSummary {
  id: string;
  name: string;
  email: string;
  roleName: string;
}
