<template>
  <div
    class="absolute inset-0 bg-slate-900/50"
    aria-hidden="true"
    data-test="modal-backdrop"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
defineEmits<{ click: [] }>();
</script>
