import type { PermissionAction } from '@/types/permission.types';

const KNOWN_PERMISSION_LABELS: Record<string, string> = {
  view_users: 'View users',
  create_user: 'Create user',
  edit_user: 'Edit user',
  delete_user: 'Delete user',
  view_roles: 'View roles',
  edit_roles: 'Edit roles',
  change_role: 'Change role',
};

export function permissionLabel(action: PermissionAction): string {
  return (
    KNOWN_PERMISSION_LABELS[action] ??
    action
      .split('_')
      .filter(Boolean)
      .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
      .join(' ')
  );
}
