<script setup lang="ts">
import BaseBadge from '../../ui/BaseBadge/BaseBadge.vue';
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import PermissionBadge from '../../permission/PermissionBadge/PermissionBadge.vue';
import PermissionGuard from '../../permission/PermissionGuard/PermissionGuard.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import { useRoleCard } from './useRoleCard';
import type { Role } from '@/types/role.types';

interface Props {
  role: Role;
}

const props = defineProps<Props>();

defineEmits<{
  (event: 'edit', role: Role): void;
}>();

const { variant, permissionsLabel } = useRoleCard(props);
</script>

<template>
  <article
    class="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
  >
    <header class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <BaseBadge :variant="variant" size="md">
          {{ role.name }}
        </BaseBadge>
        <span class="text-xs text-slate-500">
          {{ permissionsLabel }}
        </span>
      </div>
      <PermissionGuard action="edit_roles" mode="disable">
        <BaseButton
          size="sm"
          variant="primary"
          :data-test="TEST_IDS.editRole"
          @click="$emit('edit', role)"
        >
          {{ COPY.editRole }}
        </BaseButton>
      </PermissionGuard>
    </header>

    <ul v-if="role.permissions.length > 0" class="flex flex-wrap gap-2">
      <li v-for="permission in role.permissions" :key="permission.id">
        <PermissionBadge :action="permission.name" />
      </li>
    </ul>
    <p v-else class="text-sm text-slate-500">{{ COPY.noPermissionsAssigned }}</p>
  </article>
</template>
