import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authService } from '@/services/auth.service';
import { extractMessage } from '@/services/http';
import { ERROR_MESSAGES } from '@/constants/messages';
import type { PermissionAction } from '@/types/permission.types';
import type {
  PublicUserSummary,
  UserWithPermissions,
} from '@/types/user.types';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserWithPermissions | null>(null);
  const availableUsers = ref<PublicUserSummary[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const isAuthenticated = computed<boolean>(
    () => currentUser.value !== null,
  );
  const permissions = computed<PermissionAction[]>(
    () => currentUser.value?.permissions ?? [],
  );
  const roleName = computed<string | undefined>(
    () => currentUser.value?.role?.name,
  );

  async function fetchAvailableUsers(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      availableUsers.value = await authService.listUsers();
    } catch (err) {
      error.value = extractMessage(err, ERROR_MESSAGES.failedToLoadUsers);
      availableUsers.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function login(userId: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      currentUser.value = await authService.selectUser(userId);
    } catch (err) {
      error.value = extractMessage(err, ERROR_MESSAGES.loginFailed);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await authService.logout();
    } catch (err) {
      error.value = extractMessage(err, ERROR_MESSAGES.logoutFailed);
    } finally {
      currentUser.value = null;
      loading.value = false;
    }
  }

  async function fetchMe(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      currentUser.value = await authService.getMe();
    } catch {
      currentUser.value = null;
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  function clear(): void {
    currentUser.value = null;
  }

  function setUser(user: UserWithPermissions | null): void {
    currentUser.value = user;
    initialized.value = true;
  }

  return {
    currentUser,
    availableUsers,
    loading,
    error,
    initialized,
    isAuthenticated,
    permissions,
    roleName,
    fetchAvailableUsers,
    login,
    logout,
    fetchMe,
    clear,
    setUser,
  };
});
