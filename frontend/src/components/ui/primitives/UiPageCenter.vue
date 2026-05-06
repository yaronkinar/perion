<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    stackGap?: '4' | '6';
    contentAlign?: 'left' | 'center';
  }>(),
  { stackGap: '6', contentAlign: 'left' },
);

const innerClass = computed(() => [
  props.stackGap === '6' ? 'space-y-6' : 'space-y-4',
  props.contentAlign === 'center' ? 'text-center' : '',
]);
</script>

<template>
  <div class="flex min-h-full items-center justify-center px-4 py-12">
    <div class="w-full max-w-md" :class="innerClass">
      <slot />
    </div>
  </div>
</template>
