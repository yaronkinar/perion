import { computed, type ComputedRef } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import type { PermissionAction } from '@/types/permission.types';

export interface UsePermissionResult {
  can: (action: PermissionAction) => boolean;
  permissions: ComputedRef<PermissionAction[]>;
}

export function usePermission(): UsePermissionResult {
  const authStore = useAuthStore();

  const permissions = computed<PermissionAction[]>(
    () => authStore.permissions,
  );

  function can(action: PermissionAction): boolean {
    return permissions.value.includes(action);
  }

  return { can, permissions };
}
