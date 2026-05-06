<script setup lang="ts" generic="T extends string | number">
import type { SelectOption } from './BaseSelect.types';
import { useBaseSelect } from './useBaseSelect';

interface Props {
  modelValue: T | null;
  options: SelectOption<T>[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
});

defineEmits<{
  (event: 'update:modelValue', value: T | null): void;
}>();

const { selectId, selectClasses, castValue } = useBaseSelect(props);
</script>

<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="text-rose-500">*</span>
    </label>
    <select
      :id="selectId"
      :name="name"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :class="selectClasses"
      :value="modelValue ?? ''"
      @change="
        $emit(
          'update:modelValue',
          castValue(($event.target as HTMLSelectElement).value),
        )
      "
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="text-xs text-rose-600">{{ error }}</p>
  </div>
</template>
