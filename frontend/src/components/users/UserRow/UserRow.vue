<script setup lang="ts">
import BaseBadge from '../../ui/BaseBadge/BaseBadge.vue';
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import PermissionGuard from '../../permission/PermissionGuard/PermissionGuard.vue';
import { roleBadgeVariant } from '@/constants/roles';
import { USER_STATUS_ACTIVE } from '@/constants/user-status';
import { COPY } from '@/constants/messages';
import type { User } from '@/types/user.types';

interface Props {
  user: User;
  showRole?: boolean;
}

withDefaults(defineProps<Props>(), { showRole: true });

defineEmits<{
  (event: 'edit', user: User): void;
  (event: 'delete', user: User): void;
}>();
</script>

<template>
  <div
    class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
  >
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-slate-900">{{ user.name }}</p>
      <p class="text-xs text-slate-500">{{ user.email }}</p>
      <div class="mt-1 flex items-center gap-2">
        <BaseBadge :variant="user.status === USER_STATUS_ACTIVE ? 'active' : 'inactive'">
          {{ user.status }}
        </BaseBadge>
        <BaseBadge v-if="showRole && user.role" :variant="roleBadgeVariant(user.role.name)">
          {{ user.role.name }}
        </BaseBadge>
      </div>
    </div>
    <div class="flex gap-2">
      <PermissionGuard action="edit_user" mode="hide">
        <BaseButton size="sm" variant="default" @click="$emit('edit', user)">
          {{ COPY.edit }}
        </BaseButton>
      </PermissionGuard>
      <PermissionGuard action="delete_user" mode="hide">
        <BaseButton size="sm" variant="danger" @click="$emit('delete', user)">
          {{ COPY.deleteUser }}
        </BaseButton>
      </PermissionGuard>
    </div>
  </div>
</template>
