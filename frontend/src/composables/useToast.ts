import { storeToRefs } from 'pinia';
import { useToastStore } from '@/stores/toast.store';

export function useToast() {
  const store = useToastStore();
  const { items } = storeToRefs(store);
  return {
    items,
    info: store.info,
    success: store.success,
    error: store.error,
    dismiss: store.dismiss,
  };
}
