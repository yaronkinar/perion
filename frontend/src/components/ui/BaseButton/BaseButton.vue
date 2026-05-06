<script setup lang="ts">
import type { ButtonSize, ButtonType, ButtonVariant } from './BaseButton.types';
import { useBaseButton } from './useBaseButton';

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
});

defineEmits<{
  (event: 'click', value: MouseEvent): void;
}>();

const { classes, isDisabled } = useBaseButton(props);
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    @click="$emit('click', $event)"
  >
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <span :class="loading ? 'opacity-80' : ''">
      <slot />
    </span>
  </button>
</template>
