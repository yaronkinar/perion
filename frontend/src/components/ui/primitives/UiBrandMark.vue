<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: 'lg' | 'sm';
    label?: string;
  }>(),
  { size: 'lg', label: 'P' },
);

const klass = computed(() =>
  props.size === 'lg'
    ? 'mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-md'
    : 'inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white',
);
</script>

<template>
  <span :class="klass" aria-hidden="true">{{ label }}</span>
</template>
