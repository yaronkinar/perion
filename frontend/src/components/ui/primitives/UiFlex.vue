<script setup lang="ts">
import { computed } from 'vue';

export type UiFlexVariant =
  | 'contentBetween'
  | 'inlineActions'
  | 'formActions'
  | 'itemsStartMd'
  | 'itemsStart'
  | 'metaRow'
  | 'identityRow'
  | 'stackCompact'
  | 'buttonRow'
  | 'chipWrap'
  | 'contentBetweenTight';

const props = defineProps<{
  variant: UiFlexVariant;
  as?: 'div' | 'header' | 'footer' | 'li' | 'ul';
}>();

const classes = computed(() => {
  const map: Record<UiFlexVariant, string> = {
    contentBetween: 'flex items-center justify-between',
    inlineActions: 'flex justify-end gap-2',
    formActions: 'flex justify-end gap-2 pt-2',
    itemsStartMd: 'flex items-center gap-3',
    itemsStart: 'flex items-center gap-2',
    metaRow: 'mt-1 flex items-center gap-2',
    identityRow: 'flex items-center gap-2 text-sm',
    stackCompact: 'flex flex-col gap-1',
    buttonRow: 'flex gap-2',
    chipWrap: 'flex flex-wrap gap-2',
    contentBetweenTight: 'flex items-center justify-between gap-2',
  };
  return map[props.variant];
});

const tag = computed(() => props.as ?? 'div');
</script>

<template>
  <component :is="tag" :class="classes">
    <slot />
  </component>
</template>
