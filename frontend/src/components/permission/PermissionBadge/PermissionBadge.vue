<script setup lang="ts">
import BaseBadge from '../../ui/BaseBadge/BaseBadge.vue';
import { usePermissionBadge } from './usePermissionBadge';
import type { PermissionAction } from '@/types/permission.types';

interface Props {
  action: PermissionAction;
}

const props = defineProps<Props>();

const { label } = usePermissionBadge(props);
</script>

<template>
  <BaseBadge variant="permission" size="sm">
    {{ label }}
  </BaseBadge>
</template>
