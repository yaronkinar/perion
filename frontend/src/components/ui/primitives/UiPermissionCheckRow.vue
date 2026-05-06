<script setup lang="ts">
defineProps<{
  inputId: string;
  checked: boolean;
}>();

defineEmits<{
  change: [event: Event];
}>();
</script>

<template>
  <li
    class="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2"
  >
    <input
      :id="inputId"
      type="checkbox"
      :checked="checked"
      class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      @change="$emit('change', $event)"
    />
    <label :for="inputId" class="select-none text-sm text-slate-700">
      <slot />
    </label>
  </li>
</template>
