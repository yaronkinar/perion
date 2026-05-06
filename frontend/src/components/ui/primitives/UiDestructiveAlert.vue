<script setup lang="ts">
import { computed } from 'vue';

type Density = 'panel' | 'compact' | 'compactXs';

const props = defineProps<{
  message: string;
  density?: Density;
}>();

const klass = computed(() => {
  const d = props.density ?? 'panel';
  if (d === 'compactXs') {
    return 'rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700';
  }
  if (d === 'compact') {
    return 'rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700';
  }
  return 'rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700';
});
</script>

<template>
  <div role="alert" :class="klass">
    {{ message }}
  </div>
</template>
