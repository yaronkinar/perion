<script setup lang="ts">
import { useBaseInput } from './useBaseInput';

interface Props {
  modelValue: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  id?: string;
  name?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
});

defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'blur', value: FocusEvent): void;
}>();

const { inputId, inputClasses } = useBaseInput(props);
</script>

<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="text-rose-500">*</span>
    </label>
    <input
      :id="inputId"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :aria-invalid="error ? 'true' : undefined"
      :class="inputClasses"
      @input="
        $emit(
          'update:modelValue',
          ($event.target as HTMLInputElement).value,
        )
      "
      @blur="$emit('blur', $event)"
    />
    <p v-if="error" class="text-xs text-rose-600">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
