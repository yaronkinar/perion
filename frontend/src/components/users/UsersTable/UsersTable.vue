<script setup lang="ts">
import BaseBadge from '../../ui/BaseBadge/BaseBadge.vue';
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import BaseTable from '../../ui/BaseTable/BaseTable.vue';
import PermissionGuard from '../../permission/PermissionGuard/PermissionGuard.vue';
import { roleBadgeVariant } from '@/constants/roles';
import { USER_STATUS_ACTIVE } from '@/constants/user-status';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import { USERS_TABLE_COLUMN_LABELS, useUsersTable } from './useUsersTable';
import type { User } from '@/types/user.types';

interface Props {
  users: User[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

defineEmits<{
  (event: 'edit', user: User): void;
  (event: 'delete', user: User): void;
}>();

const { showRoleColumn, showActionsColumn, columns } = useUsersTable();
</script>

<template>
  <BaseTable
    :columns="columns"
    :rows="(users as unknown as (User & Record<string, unknown>)[])"
    row-key="id"
    :loading="loading"
    :empty-message="USERS_TABLE_COLUMN_LABELS.emptyMessage"
  >
    <template #cell-status="{ row }">
      <BaseBadge
        :variant="(row as User).status === USER_STATUS_ACTIVE ? 'active' : 'inactive'"
      >
        {{ (row as User).status }}
      </BaseBadge>
    </template>

    <template v-if="showRoleColumn" #cell-role="{ row }">
      <BaseBadge :variant="roleBadgeVariant((row as User).role?.name)">
        {{ (row as User).role?.name ?? USERS_TABLE_COLUMN_LABELS.emRowFallback }}
      </BaseBadge>
    </template>

    <template v-if="showActionsColumn" #cell-actions="{ row }">
      <div class="flex justify-end gap-2">
        <PermissionGuard action="edit_user" mode="hide">
          <BaseButton
            size="sm"
            variant="default"
            :data-test="TEST_IDS.editUser"
            @click="$emit('edit', row as User)"
          >
            {{ COPY.edit }}
          </BaseButton>
        </PermissionGuard>
        <PermissionGuard action="delete_user" mode="hide">
          <BaseButton
            size="sm"
            variant="danger"
            :data-test="TEST_IDS.deleteUser"
            @click="$emit('delete', row as User)"
          >
            {{ COPY.deleteUser }}
          </BaseButton>
        </PermissionGuard>
      </div>
    </template>
  </BaseTable>
</template>
