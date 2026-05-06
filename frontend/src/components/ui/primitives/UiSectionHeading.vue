<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    layout?: 'split' | 'stack';
  }>(),
  { layout: 'split' },
);
</script>

<template>
  <header
    :class="
      props.layout === 'split'
        ? 'mb-4 flex items-center justify-between'
        : 'mb-4'
    "
  >
    <div>
      <slot name="title" />
      <slot name="description" />
    </div>
    <div v-if="props.layout === 'split'">
      <slot name="action" />
    </div>
  </header>
</template>
