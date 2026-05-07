import { computed, watch, type ComputedRef, type Ref } from 'vue';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { SelectOption } from '../../ui/BaseSelect/BaseSelect.types';
import { usePermission } from '@/composables/usePermission';
import { COPY } from '@/constants/messages';
import { updateUserSchema } from '@/schemas/user.schema';
import type { Role } from '@/types/role.types';
import type { UpdateUserDto, User, UserStatus } from '@/types/user.types';

const FIELD_KEYS = ['name', 'email', 'status', 'roleId'] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

interface EditUserFormValues {
  name: string;
  email: string;
  status: UserStatus;
  roleId: string | null;
}

const initialValues = (): EditUserFormValues => ({
  name: '',
  email: '',
  status: 'active',
  roleId: null,
});

export interface UseEditUserModalReturn {
  name: Ref<string>;
  email: Ref<string>;
  status: Ref<UserStatus>;
  roleId: Ref<string | null>;
  errors: ComputedRef<Partial<Record<FieldKey, string>>>;
  canChangeRole: ComputedRef<boolean>;
  roleOptions: ComputedRef<SelectOption<string>[]>;
  statusOptions: SelectOption<UserStatus>[];
  handleEmailBlur: () => Promise<unknown>;
  handleSubmit: (event?: Event) => Promise<unknown>;
}

export function useEditUserModal(
  props: {
    open: boolean;
    user: User | null;
    roles: Role[];
    serverErrors?: Record<string, string>;
  },
  emit: {
    (event: 'close'): void;
    (event: 'submit', payload: { id: string; dto: UpdateUserDto }): void;
  },
): UseEditUserModalReturn {
  const validationSchema = toTypedSchema(updateUserSchema);

  const form = useForm<EditUserFormValues>({
    validationSchema,
    initialValues: initialValues(),
  });

  const { value: name } = useField<string>('name');
  const { value: email } = useField<string>('email');
  const { value: status } = useField<UserStatus>('status');
  const { value: roleId } = useField<string | null>('roleId');

  const errors = computed<Partial<Record<FieldKey, string>>>(() => {
    const typedErrors: Partial<Record<FieldKey, string>> = {};
    for (const key of FIELD_KEYS) {
      const message = form.errors.value[key];
      if (message) typedErrors[key] = message;
    }
    return typedErrors;
  });

  const { can } = usePermission();
  const canChangeRole = computed<boolean>(() => can('change_role'));

  const roleOptions = computed<SelectOption<string>[]>(() =>
    props.roles.map((role) => ({ label: role.name, value: role.id })),
  );

  const statusOptions: SelectOption<UserStatus>[] = [
    { label: COPY.statusActive, value: 'active' },
    { label: COPY.statusInactive, value: 'inactive' },
  ];

  watch(
    () => [props.open, props.user] as const,
    ([isOpen, user]) => {
      if (isOpen && user) {
        form.resetForm({
          values: {
            name: user.name,
            email: user.email,
            status: user.status,
            roleId: user.role?.id ?? null,
          },
        });
      }
    },
    { immediate: true },
  );

  watch(
    () => FIELD_KEYS.map((key) => props.serverErrors?.[key] ?? '').join('\u0000'),
    () => {
      const incoming = props.serverErrors ?? {};
      for (const key of FIELD_KEYS) {
        const message = incoming[key];
        if (message) form.setFieldError(key, message);
      }
    },
  );

  const handleSubmit = form.handleSubmit((values) => {
    if (!props.user) return;
    const dto: UpdateUserDto = {
      name: values.name,
      email: values.email,
      status: values.status,
    };
    if (canChangeRole.value && values.roleId) {
      dto.roleId = values.roleId;
    }
    emit('submit', { id: props.user.id, dto });
  });

  function handleEmailBlur(): Promise<unknown> {
    return form.validateField('email');
  }

  return {
    name,
    email,
    status,
    roleId,
    errors,
    canChangeRole,
    roleOptions,
    statusOptions,
    handleEmailBlur,
    handleSubmit,
  };
}
