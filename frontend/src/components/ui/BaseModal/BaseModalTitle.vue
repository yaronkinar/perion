<script setup lang="ts">
defineProps<{ id: string }>();
</script>

<template>
  <h2 :id="id" class="text-lg font-semibold text-slate-900">
    <slot />
  </h2>
</template>
