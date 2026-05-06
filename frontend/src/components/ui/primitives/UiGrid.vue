<script setup lang="ts">
import { computed } from 'vue';

export type UiGridVariant = 'tabs' | 'permissions' | 'roles';

const props = withDefaults(
  defineProps<{
    variant: UiGridVariant;
    as?: 'div' | 'ul';
  }>(),
  { as: 'div' },
);

const klass = computed(() => {
  const map: Record<UiGridVariant, string> = {
    tabs: 'grid grid-cols-2 gap-1',
    permissions: 'grid grid-cols-1 gap-2 sm:grid-cols-2',
    roles: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  };
  return map[props.variant];
});

const tag = computed(() => props.as);
</script>

<template>
  <component :is="tag" :class="klass">
    <slot />
  </component>
</template>
