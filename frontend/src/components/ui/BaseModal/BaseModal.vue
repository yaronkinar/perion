<script setup lang="ts">
import { computed, useSlots } from 'vue';
import BaseModalBackdrop from './BaseModalBackdrop.vue';
import BaseModalBodyPadding from './BaseModalBodyPadding.vue';
import BaseModalCloseButton from './BaseModalCloseButton.vue';
import BaseModalFooterRow from './BaseModalFooterRow.vue';
import BaseModalHeaderRow from './BaseModalHeaderRow.vue';
import BaseModalRootLayer from './BaseModalRootLayer.vue';
import BaseModalTitle from './BaseModalTitle.vue';
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
      <BaseModalRootLayer v-if="open">
        <BaseModalBackdrop @click="handleBackdropClick" />
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
          <BaseModalHeaderRow v-if="hasLabelledHeader">
            <template #title>
              <slot name="header">
                <BaseModalTitle :id="titleId">
                  {{ title }}
                </BaseModalTitle>
              </slot>
            </template>
            <template #actions>
              <BaseModalCloseButton @click="emit('close')" />
            </template>
          </BaseModalHeaderRow>
          <BaseModalBodyPadding>
            <slot />
          </BaseModalBodyPadding>
          <BaseModalFooterRow v-if="$slots.footer">
            <slot name="footer" />
          </BaseModalFooterRow>
        </div>
      </BaseModalRootLayer>
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
