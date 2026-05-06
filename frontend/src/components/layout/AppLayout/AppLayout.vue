<script setup lang="ts">
import AppHeader from '../AppHeader/AppHeader.vue';
import UiAppShell from '@/components/ui/primitives/UiAppShell.vue';

defineProps<{ title?: string }>();

defineEmits<{
  (event: 'logout'): void;
}>();
</script>

<template>
  <UiAppShell>
    <template #header>
      <AppHeader :title="title" @logout="$emit('logout')" />
    </template>
    <slot />
  </UiAppShell>
</template>
