import { defineStore } from 'pinia';
import { ref } from 'vue';
import { extractMessage } from '@/services/http';
import { usersService } from '@/services/users.service';
import { ERROR_MESSAGES } from '@/constants/messages';
import type {
  CreateUserDto,
  UpdateUserDto,
  User,
} from '@/types/user.types';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  async function fetchUsers(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      users.value = await usersService.getUsers();
    } catch (err) {
      error.value = extractMessage(err, ERROR_MESSAGES.failedToLoadUsers);
      users.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createUser(dto: CreateUserDto): Promise<User> {
    saving.value = true;
    error.value = null;
    try {
      const user = await usersService.createUser(dto);
      users.value = [...users.value, user].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      return user;
    } catch (err) {
      error.value = extractMessage(err, ERROR_MESSAGES.failedToCreateUser);
      throw err;
    } finally {
      saving.value = false;
    }
  }

  async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    saving.value = true;
    error.value = null;
    try {
      const user = await usersService.updateUser(id, dto);
      users.value = users.value.map((u) => (u.id === user.id ? user : u));
      return user;
    } catch (err) {
      error.value = extractMessage(err, ERROR_MESSAGES.failedToUpdateUser);
      throw err;
    } finally {
      saving.value = false;
    }
  }

  async function deleteUser(id: string): Promise<void> {
    saving.value = true;
    error.value = null;
    try {
      await usersService.deleteUser(id);
      users.value = users.value.filter((u) => u.id !== id);
    } catch (err) {
      error.value = extractMessage(err, ERROR_MESSAGES.failedToDeleteUser);
      throw err;
    } finally {
      saving.value = false;
    }
  }

  function clear(): void {
    users.value = [];
    error.value = null;
  }

  return {
    users,
    loading,
    saving,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clear,
  };
});
