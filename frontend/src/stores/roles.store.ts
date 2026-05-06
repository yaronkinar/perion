import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { extractMessage } from '@/services/http';
import { rolesService } from '@/services/roles.service';
import { ERROR_MESSAGES } from '@/constants/messages';
import type { Permission, Role, UpdateRoleDto } from '@/types/role.types';

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  const allPermissions = computed<Permission[]>(() => {
    const seen = new Map<string, Permission>();
    for (const role of roles.value) {
      for (const permission of role.permissions) {
        if (!seen.has(permission.id)) {
          seen.set(permission.id, permission);
        }
      }
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });

  async function fetchRoles(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      roles.value = await rolesService.getRoles();
    } catch (err) {
      error.value = extractMessage(err, ERROR_MESSAGES.failedToLoadRoles);
      roles.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    saving.value = true;
    error.value = null;
    try {
      const updated = await rolesService.updateRole(id, dto);
      roles.value = roles.value.map((r) => (r.id === updated.id ? updated : r));
      return updated;
    } catch (err) {
      error.value = extractMessage(err, ERROR_MESSAGES.failedToUpdateRole);
      throw err;
    } finally {
      saving.value = false;
    }
  }

  function clear(): void {
    roles.value = [];
    error.value = null;
  }

  return {
    roles,
    loading,
    saving,
    error,
    allPermissions,
    fetchRoles,
    updateRole,
    clear,
  };
});
