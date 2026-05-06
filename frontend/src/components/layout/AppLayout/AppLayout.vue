<script setup lang="ts">
import AppHeader from '../AppHeader/AppHeader.vue';

defineProps<{ title?: string }>();

defineEmits<{
  (event: 'logout'): void;
}>();
</script>

<template>
  <div class="flex min-h-full flex-col">
    <AppHeader :title="title" @logout="$emit('logout')" />
    <main class="mx-auto w-full max-w-6xl flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
