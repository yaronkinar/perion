<script setup lang="ts">
import { usePermissionGuard } from './usePermissionGuard';
import type { PermissionAction } from '@/types/permission.types';

type GuardMode = 'hide' | 'disable';

interface Props {
  action: PermissionAction;
  mode?: GuardMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'hide',
});

const { allowed, renderDisabled } = usePermissionGuard(props);
</script>

<template>
  <template v-if="mode === 'hide'">
    <slot v-if="allowed" />
  </template>
  <template v-else>
    <slot v-if="allowed" />
    <component :is="{ render: () => renderDisabled() }" v-else />
  </template>
</template>
