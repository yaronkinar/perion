<script setup lang="ts">
defineProps<{
  selected: boolean;
  dataTest?: string;
  id?: string;
  controls?: string;
  tabIndex?: number;
}>();
</script>

<template>
  <button
    :id="id"
    type="button"
    role="tab"
    :aria-controls="controls"
    :aria-selected="selected"
    :tabindex="tabIndex"
    :data-test="dataTest"
    :class="[
      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
      selected
        ? 'bg-brand-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100',
    ]"
  >
    <slot />
  </button>
</template>
