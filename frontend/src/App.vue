<script setup lang="ts">
import { useAppRoot } from '@/useAppRoot';
import UiRootStretch from '@/components/ui/primitives/UiRootStretch.vue';
import UiToastAnchor from '@/components/ui/primitives/UiToastAnchor.vue';
import UiToastBubble from '@/components/ui/primitives/UiToastBubble.vue';

const { items, variantClasses } = useAppRoot();
</script>

<template>
  <UiRootStretch>
    <RouterView />

    <UiToastAnchor>
      <transition-group name="toast">
        <UiToastBubble
          v-for="item in items"
          :key="item.id"
          :bubble-class="variantClasses(item.variant)"
          :data-test="`toast-${item.variant}`"
        >
          {{ item.message }}
        </UiToastBubble>
      </transition-group>
    </UiToastAnchor>
  </UiRootStretch>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 200ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
