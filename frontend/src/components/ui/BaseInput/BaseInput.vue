<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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
  /** When `type` is `password`, adds a button to reveal or hide the value. */
  showPasswordToggle?: boolean;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  /** `data-test` for the visibility toggle (not the text input). */
  passwordToggleTestId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  showPasswordToggle: false,
  showPasswordLabel: 'Show password',
  hidePasswordLabel: 'Hide password',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'blur', value: FocusEvent): void;
}>();

const { inputId, inputClasses } = useBaseInput(props);

const passwordVisible = ref(false);

const showPasswordToggleUi = computed(
  () => props.type === 'password' && props.showPasswordToggle,
);

const effectiveInputType = computed(() => {
  if (showPasswordToggleUi.value) {
    return passwordVisible.value ? 'text' : 'password';
  }
  return props.type;
});

const inputFieldClass = computed(() =>
  showPasswordToggleUi.value ? [...inputClasses.value, 'pr-12'] : inputClasses.value,
);

const errorId = computed(() => `${inputId.value}-error`);
const hintId = computed(() => `${inputId.value}-hint`);
const describedBy = computed(() => {
  if (props.error) return errorId.value;
  if (props.hint) return hintId.value;
  return undefined;
});

watch(
  () => props.type,
  () => {
    passwordVisible.value = false;
  },
);

function togglePasswordVisibility(): void {
  passwordVisible.value = !passwordVisible.value;
}

function onInput(e: Event): void {
  const t = e.target as HTMLInputElement | null;
  if (t) emit('update:modelValue', t.value);
}

function onBlur(e: FocusEvent): void {
  emit('blur', e);
}
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
    <div class="relative">
      <input
        :id="inputId"
        :name="name"
        :type="effectiveInputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :class="inputFieldClass"
        @input="onInput"
        @blur="onBlur"
      />
      <button
        v-if="showPasswordToggleUi"
        type="button"
        class="absolute right-1.5 top-1/2 z-20 flex h-9 w-9 shrink-0 -translate-y-1/2 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none"
        :class="
          error
            ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-800 focus-visible:ring-rose-400'
            : ''
        "
        :disabled="disabled"
        :aria-label="
          passwordVisible ? hidePasswordLabel : showPasswordLabel
        "
        :aria-pressed="passwordVisible"
        :data-test="passwordToggleTestId"
        @click="togglePasswordVisibility"
      >
        <!-- Material "visibility" (password hidden) — same glyph family as Google sign-in -->
        <svg
          v-if="!passwordVisible"
          class="pointer-events-none h-6 w-6"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
          />
        </svg>
        <!-- Material "visibility_off" (password visible) -->
        <svg
          v-else
          class="pointer-events-none h-6 w-6"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
          />
        </svg>
      </button>
    </div>
    <p v-if="error" :id="errorId" class="text-xs text-rose-600">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
