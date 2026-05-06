import type { PermissionAction } from '@/types/permission.types';

export const PERMISSION_LABELS: Record<PermissionAction, string> = {
  view_users: 'View users',
  create_user: 'Create user',
  edit_user: 'Edit user',
  delete_user: 'Delete user',
  view_roles: 'View roles',
  edit_roles: 'Edit roles',
  change_role: 'Change role',
};
