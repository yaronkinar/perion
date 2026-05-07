import { computed } from 'vue';
import { permissionLabel } from '@/constants/permissions';
import type { PermissionAction } from '@/types/permission.types';

export function usePermissionBadge(props: { action: PermissionAction }) {
  const label = computed<string>(() => permissionLabel(props.action));
  return { label };
}
