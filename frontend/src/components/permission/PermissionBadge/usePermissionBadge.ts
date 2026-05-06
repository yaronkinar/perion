import { computed } from 'vue';
import { PERMISSION_LABELS } from '@/constants/permissions';
import type { PermissionAction } from '@/types/permission.types';

export function usePermissionBadge(props: { action: PermissionAction }) {
  const label = computed<string>(() => PERMISSION_LABELS[props.action]);
  return { label };
}
