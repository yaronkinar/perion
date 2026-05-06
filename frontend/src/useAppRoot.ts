import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useRolesStore } from '@/stores/roles.store';
import { useToastStore } from '@/stores/toast.store';
import { useUsersStore } from '@/stores/users.store';
import {
  registerToastSink,
  registerUnauthorizedHandler,
} from '@/services/http';
import { ROUTE_NAMES, TOAST_VARIANTS } from '@/constants/messages';
import type { ToastVariant } from '@/stores/toast.store';

let httpHandlersRegistered = false;

export function useAppRoot() {
  const auth = useAuthStore();
  const usersStore = useUsersStore();
  const rolesStore = useRolesStore();
  const toastStore = useToastStore();
  const { items } = storeToRefs(toastStore);
  const router = useRouter();

  if (!httpHandlersRegistered) {
    registerToastSink({
      error: (message) => toastStore.error(message),
    });

    registerUnauthorizedHandler(() => {
      auth.clear();
      usersStore.clear();
      rolesStore.clear();
      void router.push({ name: ROUTE_NAMES.LOGIN });
    });

    httpHandlersRegistered = true;
  }

  onMounted(async () => {
    if (!auth.initialized) {
      await auth.fetchMe();
    }
  });

  function variantClasses(variant: ToastVariant): string {
    if (variant === TOAST_VARIANTS.SUCCESS) return 'bg-emerald-600 text-white';
    if (variant === TOAST_VARIANTS.ERROR) return 'bg-rose-600 text-white';
    return 'bg-slate-800 text-white';
  }

  return { items, variantClasses };
}
