<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { useBaseModal } from './useBaseModal';
import type { ModalSize } from './useBaseModal';

interface Props {
  open: boolean;
  title?: string;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnBackdrop: true,
});

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const slots = useSlots();

const { panelRef, titleId, handleBackdropClick, sizeClassMap } = useBaseModal(
  props,
  (event: 'close') => emit(event),
);

const hasLabelledHeader = computed<boolean>(
  () => Boolean(props.title) || Boolean(slots.header),
);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-slate-900/50"
          aria-hidden="true"
          data-test="modal-backdrop"
          @click="handleBackdropClick"
        />
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="hasLabelledHeader ? titleId : undefined"
          :aria-label="!hasLabelledHeader ? 'Dialog' : undefined"
          tabindex="-1"
          :class="[
            'relative z-10 w-full rounded-lg bg-white shadow-xl outline-none focus:ring-2 focus:ring-brand-500',
            sizeClassMap[size],
          ]"
        >
          <header
            v-if="hasLabelledHeader"
            class="flex items-center justify-between border-b border-slate-200 px-5 py-3"
          >
            <slot name="header">
              <h2 :id="titleId" class="text-lg font-semibold text-slate-900">
                {{ title }}
              </h2>
            </slot>
            <button
              type="button"
              class="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Close"
              @click="emit('close')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-5 w-5"
              >
                <path
                  d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                />
              </svg>
            </button>
          </header>
          <div class="px-5 py-4">
            <slot />
          </div>
          <footer
            v-if="$slots.footer"
            class="flex justify-end gap-2 border-t border-slate-200 px-5 py-3"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
