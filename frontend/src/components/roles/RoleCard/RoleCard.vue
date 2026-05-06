<script setup lang="ts">
import BaseBadge from '../../ui/BaseBadge/BaseBadge.vue';
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import PermissionBadge from '../../permission/PermissionBadge/PermissionBadge.vue';
import PermissionGuard from '../../permission/PermissionGuard/PermissionGuard.vue';
import UiFlex from '@/components/ui/primitives/UiFlex.vue';
import UiSurface from '@/components/ui/primitives/UiSurface.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
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
  <UiSurface variant="roleCard" as="article">
    <UiFlex variant="contentBetween">
      <UiFlex variant="itemsStart">
        <BaseBadge :variant="variant" size="md">
          {{ role.name }}
        </BaseBadge>
        <UiText variant="mutedXs" as="span">{{ permissionsLabel }}</UiText>
      </UiFlex>
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
    </UiFlex>

    <UiFlex v-if="role.permissions.length > 0" variant="chipWrap" as="ul">
      <li v-for="permission in role.permissions" :key="permission.id">
        <PermissionBadge :action="permission.name" />
      </li>
    </UiFlex>
    <UiText v-else variant="rolesEmpty">{{ COPY.noPermissionsAssigned }}</UiText>
  </UiSurface>
</template>
