<script setup lang="ts">
import { computed } from 'vue';

export type UiTextVariant =
  | 'heroTitle'
  | 'heroSubtitle'
  | 'sectionTitle'
  | 'sectionDescription'
  | 'pageTitle'
  | 'pageDescription'
  | 'error'
  | 'errorMt'
  | 'captionCenter'
  | 'strongSm'
  | 'mutedXs'
  | 'modalLead'
  | 'modalHint'
  | 'headerTitle'
  | 'headerMuted'
  | 'rolesMuted'
  | 'rolesEmpty';

const props = withDefaults(
  defineProps<{
    variant: UiTextVariant;
    as?: string;
  }>(),
  { as: '' },
);

const config = computed(() => {
  const map: Record<
    UiTextVariant,
    { tag: string; class: string }
  > = {
    heroTitle: {
      tag: 'h1',
      class: 'mt-4 text-2xl font-semibold text-slate-900',
    },
    heroSubtitle: {
      tag: 'p',
      class: 'mt-1 text-sm text-slate-600',
    },
    sectionTitle: {
      tag: 'h2',
      class: 'text-lg font-semibold text-slate-900',
    },
    sectionDescription: {
      tag: 'p',
      class: 'text-sm text-slate-500',
    },
    pageTitle: {
      tag: 'h1',
      class: 'text-2xl font-semibold text-slate-900',
    },
    pageDescription: {
      tag: 'p',
      class: 'text-sm text-slate-600',
    },
    error: {
      tag: 'p',
      class: 'text-sm text-rose-600',
    },
    errorMt: {
      tag: 'p',
      class: 'mt-2 text-sm text-rose-600',
    },
    captionCenter: {
      tag: 'p',
      class: 'text-center text-xs text-slate-500',
    },
    strongSm: {
      tag: 'p',
      class: 'text-sm font-semibold text-slate-900',
    },
    mutedXs: {
      tag: 'p',
      class: 'text-xs text-slate-500',
    },
    modalLead: {
      tag: 'p',
      class: 'text-sm text-slate-600',
    },
    modalHint: {
      tag: 'p',
      class: 'text-xs text-slate-500',
    },
    headerTitle: {
      tag: 'h1',
      class: 'text-base font-semibold text-slate-900',
    },
    headerMuted: {
      tag: 'span',
      class: 'text-sm text-slate-700',
    },
    rolesMuted: {
      tag: 'div',
      class: 'text-sm text-slate-500',
    },
    rolesEmpty: {
      tag: 'p',
      class: 'text-sm text-slate-500',
    },
  };
  return map[props.variant];
});

const tag = computed(() => props.as || config.value.tag);
const klass = computed(() => config.value.class);
</script>

<template>
  <component :is="tag" :class="klass">
    <slot />
  </component>
</template>
