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
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { SelectOption } from '@/components/ui/BaseSelect/BaseSelect.types';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
import {
  ERROR_MESSAGES,
  ROUTE_NAMES,
  SUCCESS_MESSAGES,
} from '@/constants/messages';
import { roleBadgeVariant, type RoleBadgeVariant } from '@/constants/roles';
import { extractMessage } from '@/services/http';
import { loginSchema, type LoginFormValues } from '@/schemas/login.schema';
import type { PublicUserSummary } from '@/types/user.types';

export type LoginRoleBadgeVariant = RoleBadgeVariant;
export type LoginMode = 'demo' | 'password';

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

  // Email/password (JWT) mode
  mode: Ref<LoginMode>;
  setMode: (next: LoginMode) => void;
  passwordEmail: Ref<string>;
  passwordPassword: Ref<string>;
  passwordErrors: Ref<Partial<Record<keyof LoginFormValues, string>>>;
  passwordSubmitting: Ref<boolean>;
  passwordError: Ref<string | null>;
  handlePasswordEmailBlur: (_event?: FocusEvent) => Promise<unknown>;
  handlePasswordBlur: (_event?: FocusEvent) => Promise<unknown>;
  handlePasswordInput: () => Promise<unknown>;
  handlePasswordSubmit: (event?: Event) => Promise<unknown>;
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

  // --- Email/password (JWT) form -----------------------------------------
  const mode = ref<LoginMode>('demo');
  const passwordSubmitting = ref<boolean>(false);
  const passwordError = ref<string | null>(null);

  const passwordForm = useForm<LoginFormValues>({
    validationSchema: toTypedSchema(loginSchema),
    initialValues: { email: '', password: '' },
  });
  const { value: passwordEmail } = useField<string>('email');
  const { value: passwordPassword } = useField<string>('password');
  const passwordErrors = passwordForm.errors as Ref<
    Partial<Record<keyof LoginFormValues, string>>
  >;

  function setMode(next: LoginMode): void {
    mode.value = next;
    passwordError.value = null;
  }

  onMounted(async () => {
    await auth.fetchAvailableUsers();
    // If the demo endpoint is gated (e.g. production), fall back to the
    // password form so the user always has a way in.
    if (availableUsers.value.length === 0 && error.value) {
      mode.value = 'password';
    }
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

  const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
    if (passwordSubmitting.value) return;
    passwordSubmitting.value = true;
    passwordError.value = null;
    try {
      const user = await auth.loginWithPassword(values.email, values.password);
      toast.success(SUCCESS_MESSAGES.signedInAs(user.name));
      await router.push({ name: ROUTE_NAMES.DASHBOARD });
    } catch (err) {
      const message = extractMessage(err, ERROR_MESSAGES.loginCouldNot);
      passwordError.value = message;
      toast.error(message);
    } finally {
      passwordSubmitting.value = false;
    }
  });

  function handlePasswordEmailBlur(_event?: FocusEvent): Promise<unknown> {
    passwordForm.setFieldTouched('email', true);
    return passwordForm.validateField('email');
  }

  function handlePasswordBlur(_event?: FocusEvent): Promise<unknown> {
    passwordForm.setFieldTouched('password', true);
    return passwordForm.validateField('password');
  }

  function handlePasswordInput(): Promise<unknown> {
    return passwordForm.validateField('password');
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

    mode,
    setMode,
    passwordEmail,
    passwordPassword,
    passwordErrors,
    passwordSubmitting,
    passwordError,
    handlePasswordEmailBlur,
    handlePasswordBlur,
    handlePasswordInput,
    handlePasswordSubmit,
  };
}
