import { computed, ref, watch } from 'vue';
import { PERMISSION_LABELS } from '@/constants/permissions';
import { COPY } from '@/constants/messages';
import type { Permission, Role, UpdateRoleDto } from '@/types/role.types';

export function useEditRoleModal(
  props: { open: boolean; role: Role | null; allPermissions: Permission[] },
  emit: {
    (event: 'close'): void;
    (event: 'submit', payload: { id: string; dto: UpdateRoleDto }): void;
  },
) {
  const selected = ref<Set<string>>(new Set());

  watch(
    () => [props.open, props.role] as const,
    ([isOpen, role]) => {
      if (isOpen && role) {
        selected.value = new Set(role.permissions.map((p) => p.id));
      }
    },
    { immediate: true },
  );

  function toggle(permissionId: string): void {
    const next = new Set(selected.value);
    if (next.has(permissionId)) {
      next.delete(permissionId);
    } else {
      next.add(permissionId);
    }
    selected.value = next;
  }

  const orderedPermissions = computed<Permission[]>(() =>
    [...props.allPermissions].sort((a, b) =>
      PERMISSION_LABELS[a.name].localeCompare(PERMISSION_LABELS[b.name]),
    ),
  );

  const modalTitle = computed<string>(() =>
    props.role ? COPY.editRoleTitle(props.role.name) : COPY.editRoleFallbackTitle,
  );

  function handleSubmit(event: Event): void {
    event.preventDefault();
    if (!props.role) return;
    emit('submit', {
      id: props.role.id,
      dto: { permissionIds: Array.from(selected.value) },
    });
  }

  return {
    selected,
    orderedPermissions,
    modalTitle,
    toggle,
    handleSubmit,
  };
}
