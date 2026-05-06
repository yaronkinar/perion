import { defineStore } from 'pinia';
import { ref } from 'vue';
import { TOAST_DISMISS_MS, TOAST_VARIANTS } from '@/constants/messages';

export type ToastVariant =
  (typeof TOAST_VARIANTS)[keyof typeof TOAST_VARIANTS];

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

let nextId = 1;

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([]);

  function push(message: string, variant: ToastVariant): number {
    const id = nextId++;
    items.value = [...items.value, { id, message, variant }];
    setTimeout(() => dismiss(id), TOAST_DISMISS_MS);
    return id;
  }

  function info(message: string): number {
    return push(message, TOAST_VARIANTS.INFO);
  }

  function success(message: string): number {
    return push(message, TOAST_VARIANTS.SUCCESS);
  }

  function error(message: string): number {
    return push(message, TOAST_VARIANTS.ERROR);
  }

  function dismiss(id: number): void {
    items.value = items.value.filter((item) => item.id !== id);
  }

  return { items, push, info, success, error, dismiss };
});
