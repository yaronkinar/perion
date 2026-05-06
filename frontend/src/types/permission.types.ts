export type PermissionAction =
  | 'view_users'
  | 'create_user'
  | 'edit_user'
  | 'delete_user'
  | 'view_roles'
  | 'edit_roles'
  | 'change_role';

export const ALL_PERMISSIONS: readonly PermissionAction[] = [
  'view_users',
  'create_user',
  'edit_user',
  'delete_user',
  'view_roles',
  'edit_roles',
  'change_role',
] as const;
