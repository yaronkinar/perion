<script setup lang="ts">
import type { BadgeVariant } from './BaseBadge.types';
import { useBaseBadge } from './useBaseBadge';

interface Props {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'sm',
});

const { classes } = useBaseBadge(props);
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
