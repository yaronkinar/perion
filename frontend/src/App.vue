<script setup lang="ts">
import { useAppRoot } from '@/useAppRoot';

const { items, variantClasses } = useAppRoot();
</script>

<template>
  <div class="min-h-full">
    <RouterView />

    <div
      class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      <transition-group name="toast">
        <div
          v-for="item in items"
          :key="item.id"
          :class="[
            'pointer-events-auto rounded-md px-4 py-2 text-sm shadow-lg',
            variantClasses(item.variant),
          ]"
          role="status"
          :data-test="`toast-${item.variant}`"
        >
          {{ item.message }}
        </div>
      </transition-group>
    </div>
  </div>
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
