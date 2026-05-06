<script setup lang="ts">
defineProps<{
  bubbleClass: string;
  dataTest?: string;
}>();
</script>

<template>
  <div
    class="pointer-events-auto rounded-md px-4 py-2 text-sm shadow-lg"
    :class="bubbleClass"
    role="status"
    :data-test="dataTest"
  >
    <slot />
  </div>
</template>
