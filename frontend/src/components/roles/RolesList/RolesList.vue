<script setup lang="ts">
import RoleCard from '../RoleCard/RoleCard.vue';
import { useRolesList } from './useRolesList';
import type { Role } from '@/types/role.types';

interface Props {
  roles: Role[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), { loading: false });

defineEmits<{
  (event: 'edit', role: Role): void;
}>();

const { loadingText, emptyText } = useRolesList();
</script>

<template>
  <div v-if="loading" class="text-sm text-slate-500">{{ loadingText }}</div>
  <div v-else-if="roles.length === 0" class="text-sm text-slate-500">
    {{ emptyText }}
  </div>
  <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <RoleCard
      v-for="role in roles"
      :key="role.id"
      :role="role"
      @edit="$emit('edit', $event)"
    />
  </div>
</template>
