<script setup lang="ts">
import BaseBadge from '../../ui/BaseBadge/BaseBadge.vue';
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import PermissionGuard from '../../permission/PermissionGuard/PermissionGuard.vue';
import UiFlex from '@/components/ui/primitives/UiFlex.vue';
import UiSurface from '@/components/ui/primitives/UiSurface.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
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
  <UiSurface variant="rowCard">
    <UiFlex variant="stackCompact">
      <UiText variant="strongSm">{{ user.name }}</UiText>
      <UiText variant="mutedXs">{{ user.email }}</UiText>
      <UiFlex variant="metaRow">
        <BaseBadge :variant="user.status === USER_STATUS_ACTIVE ? 'active' : 'inactive'">
          {{ user.status }}
        </BaseBadge>
        <BaseBadge
          v-if="showRole && user.role"
          :variant="roleBadgeVariant(user.role.name)"
        >
          {{ user.role.name }}
        </BaseBadge>
      </UiFlex>
    </UiFlex>
    <UiFlex variant="buttonRow">
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
    </UiFlex>
  </UiSurface>
</template>
