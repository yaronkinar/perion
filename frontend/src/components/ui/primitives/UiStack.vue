<script setup lang="ts">
import { computed } from 'vue';

type StackGap = 'none' | '1' | '4' | '6' | '10';

const props = withDefaults(
  defineProps<{
    gap?: StackGap;
  }>(),
  { gap: '4' },
);

const gapClass = computed(() => {
  const map: Record<StackGap, string> = {
    none: '',
    '1': 'space-y-1',
    '4': 'space-y-4',
    '6': 'space-y-6',
    '10': 'space-y-10',
  };
  return map[props.gap];
});
</script>

<template>
  <div :class="gapClass">
    <slot />
  </div>
</template>
