import {
  computed,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, type Router } from 'vue-router';
import type { SelectOption } from '@/components/ui/BaseSelect/BaseSelect.types';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
import {
  ERROR_MESSAGES,
  ROUTE_NAMES,
  SUCCESS_MESSAGES,
} from '@/constants/messages';
import { roleBadgeVariant, type RoleBadgeVariant } from '@/constants/roles';
import type { PublicUserSummary } from '@/types/user.types';

export type LoginRoleBadgeVariant = RoleBadgeVariant;

export interface UseLoginPageReturn {
  availableUsers: Ref<PublicUserSummary[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  selectedUserId: Ref<string | null>;
  submitting: Ref<boolean>;
  userOptions: ComputedRef<SelectOption<string>[]>;
  selectedUser: ComputedRef<PublicUserSummary | null>;
  badgeVariant: (roleName: string) => LoginRoleBadgeVariant;
  handleSubmit: (event: Event) => Promise<void>;
}

interface UseLoginPageOptions {
  router?: Router;
}

export function useLoginPage(
  options: UseLoginPageOptions = {},
): UseLoginPageReturn {
  const router = options.router ?? useRouter();
  const auth = useAuthStore();
  const toast = useToastStore();
  const { availableUsers, loading, error } = storeToRefs(auth);

  const selectedUserId = ref<string | null>(null);
  const submitting = ref<boolean>(false);

  onMounted(async () => {
    await auth.fetchAvailableUsers();
  });

  watch(availableUsers, (users) => {
    if (selectedUserId.value === null && users.length > 0) {
      selectedUserId.value = users[0].id;
    }
  });

  const userOptions = computed<SelectOption<string>[]>(() =>
    availableUsers.value.map((user) => ({
      label: `${user.name} — ${user.roleName}`,
      value: user.id,
    })),
  );

  const selectedUser = computed<PublicUserSummary | null>(() => {
    if (!selectedUserId.value) return null;
    return (
      availableUsers.value.find((u) => u.id === selectedUserId.value) ?? null
    );
  });

  function badgeVariant(roleName: string): LoginRoleBadgeVariant {
    return roleBadgeVariant(roleName);
  }

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const user = selectedUser.value;
    if (!user || submitting.value) return;
    submitting.value = true;
    try {
      await auth.login(user.id);
      toast.success(SUCCESS_MESSAGES.signedInAs(user.name));
      await router.push({ name: ROUTE_NAMES.DASHBOARD });
    } catch {
      toast.error(ERROR_MESSAGES.loginCouldNot);
    } finally {
      submitting.value = false;
    }
  }

  return {
    availableUsers,
    loading,
    error,
    selectedUserId,
    submitting,
    userOptions,
    selectedUser,
    badgeVariant,
    handleSubmit,
  };
}
