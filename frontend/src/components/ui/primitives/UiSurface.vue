<script setup lang="ts">
import { computed, useAttrs } from 'vue';

export type UiSurfaceVariant =
  | 'elevated'
  | 'muted'
  | 'tabShell'
  | 'inset'
  | 'notice'
  | 'table'
  | 'rowCard'
  | 'roleCard';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    variant: UiSurfaceVariant;
    /** Root tag (`form` for submissions). */
    as?: 'div' | 'form' | 'article' | 'section';
  }>(),
  { as: 'div' },
);

const attrs = useAttrs();

const variantClass = computed(() => {
  const map: Record<UiSurfaceVariant, string> = {
    elevated:
      'rounded-lg border border-slate-200 bg-white p-6 shadow-sm',
    muted:
      'rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500',
    tabShell:
      'rounded-lg border border-slate-200 bg-white p-2 shadow-sm',
    inset: 'rounded-md bg-slate-50 px-3 py-2 text-sm',
    notice:
      'rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500',
    table:
      'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm',
    rowCard:
      'flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm',
    roleCard:
      'flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm',
  };
  return map[props.variant];
});
</script>

<template>
  <component :is="props.as" :class="variantClass" v-bind="attrs">
    <slot />
  </component>
</template>
