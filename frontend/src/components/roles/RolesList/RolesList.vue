<script setup lang="ts">
import RoleCard from '../RoleCard/RoleCard.vue';
import UiGrid from '@/components/ui/primitives/UiGrid.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
import { useRolesList } from './useRolesList';
import type { Role } from '@/types/role.types';

interface Props {
  roles: Role[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

defineEmits<{
  (event: 'edit', role: Role): void;
}>();

const { loadingText, emptyText } = useRolesList();
</script>

<template>
  <UiText v-if="loading" variant="rolesMuted">{{ loadingText }}</UiText>
  <UiText v-else-if="roles.length === 0" variant="rolesMuted">{{ emptyText }}</UiText>
  <UiGrid v-else variant="roles">
    <RoleCard v-for="role in roles" :key="role.id" :role="role" @edit="$emit('edit', $event)" />
  </UiGrid>
</template>
