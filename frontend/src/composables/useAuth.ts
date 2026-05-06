import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const store = useAuthStore();
  const { currentUser, permissions, isAuthenticated, loading, error } =
    storeToRefs(store);

  async function login(userId: string): Promise<void> {
    await store.login(userId);
  }

  async function logout(): Promise<void> {
    await store.logout();
  }

  async function fetchMe(): Promise<void> {
    await store.fetchMe();
  }

  return {
    currentUser,
    permissions,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    fetchMe,
  };
}
