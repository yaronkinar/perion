<script setup lang="ts">
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import BaseModal from '../../ui/BaseModal/BaseModal.vue';
import { PERMISSION_LABELS } from '@/constants/permissions';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import type { Permission, Role, UpdateRoleDto } from '@/types/role.types';
import { useEditRoleModal } from './useEditRoleModal';

interface Props {
  open: boolean;
  role: Role | null;
  allPermissions: Permission[];
  saving?: boolean;
}

const props = withDefaults(defineProps<Props>(), { saving: false });

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'submit', payload: { id: string; dto: UpdateRoleDto }): void;
}>();

const {
  selected,
  orderedPermissions,
  modalTitle,
  toggle,
  handleSubmit,
} = useEditRoleModal(props, emit);
</script>

<template>
  <BaseModal :open="open" :title="modalTitle" @close="emit('close')">
    <form
      v-if="role"
      class="space-y-4"
      :data-test="TEST_IDS.editRoleForm"
      @submit="handleSubmit"
    >
      <p class="text-sm text-slate-600">
        {{ COPY.editRoleHint(role.name) }}
      </p>
      <ul
        class="grid grid-cols-1 gap-2 sm:grid-cols-2"
        :data-test="TEST_IDS.permissionList"
      >
        <li
          v-for="permission in orderedPermissions"
          :key="permission.id"
          class="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2"
        >
          <input
            :id="`perm-${permission.id}`"
            type="checkbox"
            :checked="selected.has(permission.id)"
            class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            @change="toggle(permission.id)"
          />
          <label
            :for="`perm-${permission.id}`"
            class="select-none text-sm text-slate-700"
          >
            {{ PERMISSION_LABELS[permission.name] }}
          </label>
        </li>
      </ul>
      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="default" type="button" @click="emit('close')">
          {{ COPY.cancel }}
        </BaseButton>
        <BaseButton variant="primary" type="submit" :loading="saving">
          {{ COPY.save }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
