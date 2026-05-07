import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { useUsersStore } from '@/stores/users.store';
import { useRolesStore } from '@/stores/roles.store';
import { useToastStore } from '@/stores/toast.store';
import { usePermission } from '@/composables/usePermission';
import { extractFieldErrors } from '@/services/http';
import {
  ERROR_MESSAGES,
  ROUTE_NAMES,
  SUCCESS_MESSAGES,
} from '@/constants/messages';
import type { CreateUserDto, UpdateUserDto, User } from '@/types/user.types';
import type { Role, UpdateRoleDto } from '@/types/role.types';

export function useDashboardPage() {
  const router = useRouter();
  const auth = useAuthStore();
  const users = useUsersStore();
  const roles = useRolesStore();
  const toast = useToastStore();
  const { can } = usePermission();

  const usersState = storeToRefs(users);
  const rolesState = storeToRefs(roles);

  const showAddUser = ref<boolean>(false);
  const editingUser = ref<User | null>(null);
  const deletingUser = ref<User | null>(null);
  const editingRole = ref<Role | null>(null);

  const addUserServerErrors = ref<Record<string, string>>({});
  const editUserServerErrors = ref<Record<string, string>>({});

  const canViewUsers = computed<boolean>(() => can('view_users'));
  const canViewRoles = computed<boolean>(() => can('view_roles'));

  // Reset server errors whenever a modal closes/opens.
  watch(showAddUser, (open) => {
    if (!open) addUserServerErrors.value = {};
  });
  watch(editingUser, (user) => {
    if (!user) editUserServerErrors.value = {};
  });

  onMounted(async () => {
    if (canViewUsers.value) {
      await users.fetchUsers();
    }
    if (canViewRoles.value) {
      await roles.fetchRoles();
    }
  });

  async function handleLogout(): Promise<void> {
    await auth.logout();
    users.clear();
    roles.clear();
    toast.info(SUCCESS_MESSAGES.signedOut);
    await router.push({ name: ROUTE_NAMES.LOGIN });
  }

  async function handleCreateUser(dto: CreateUserDto): Promise<void> {
    try {
      addUserServerErrors.value = {};
      await users.createUser(dto);
      toast.success(SUCCESS_MESSAGES.userCreated);
      showAddUser.value = false;
    } catch (err) {
      addUserServerErrors.value = extractFieldErrors(err);
      toast.error(usersState.error.value ?? ERROR_MESSAGES.failedToCreateUser);
    }
  }

  async function handleUpdateUser(payload: {
    id: string;
    dto: UpdateUserDto;
  }): Promise<void> {
    try {
      editUserServerErrors.value = {};
      await users.updateUser(payload.id, payload.dto);
      toast.success(SUCCESS_MESSAGES.userUpdated);
      editingUser.value = null;
    } catch (err) {
      editUserServerErrors.value = extractFieldErrors(err);
      toast.error(usersState.error.value ?? ERROR_MESSAGES.failedToUpdateUser);
    }
  }

  function requestDeleteUser(user: User): void {
    deletingUser.value = user;
  }

  function cancelDeleteUser(): void {
    deletingUser.value = null;
  }

  async function confirmDeleteUser(): Promise<void> {
    if (!deletingUser.value) return;
    try {
      await users.deleteUser(deletingUser.value.id);
      toast.success(SUCCESS_MESSAGES.userDeleted);
      deletingUser.value = null;
    } catch (err) {
      // If the row is stale and the user was already deleted elsewhere,
      // treat it as success and refresh local state.
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        await users.fetchUsers();
        toast.success(SUCCESS_MESSAGES.userDeleted);
        deletingUser.value = null;
        return;
      }
      toast.error(usersState.error.value ?? ERROR_MESSAGES.failedToDeleteUser);
    }
  }

  async function handleUpdateRole(payload: {
    id: string;
    dto: UpdateRoleDto;
  }): Promise<void> {
    try {
      await roles.updateRole(payload.id, payload.dto);
      toast.success(SUCCESS_MESSAGES.roleUpdated);
      editingRole.value = null;
      if (canViewUsers.value) {
        await users.fetchUsers();
      }
      await auth.fetchMe();
    } catch {
      toast.error(rolesState.error.value ?? ERROR_MESSAGES.failedToUpdateRole);
    }
  }

  return {
    usersState,
    rolesState,
    showAddUser,
    editingUser,
    deletingUser,
    editingRole,
    addUserServerErrors,
    editUserServerErrors,
    canViewUsers,
    canViewRoles,
    handleLogout,
    handleCreateUser,
    handleUpdateUser,
    requestDeleteUser,
    cancelDeleteUser,
    confirmDeleteUser,
    handleUpdateRole,
  };
}
