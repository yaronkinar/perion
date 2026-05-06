import { useAuth } from '@/composables/useAuth';

export function useAppHeader() {
  return useAuth();
}
