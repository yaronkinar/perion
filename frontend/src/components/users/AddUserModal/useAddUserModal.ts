import { computed, watch, type ComputedRef, type Ref } from 'vue';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { SelectOption } from '../../ui/BaseSelect/BaseSelect.types';
import { COPY } from '@/constants/messages';
import {
  createUserSchema,
  type CreateUserFormValues,
} from '@/schemas/user.schema';
import type { Role } from '@/types/role.types';
import type { CreateUserDto, UserStatus } from '@/types/user.types';

const FIELD_KEYS = ['name', 'email', 'status', 'roleId'] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

const initialValues = (): CreateUserFormValues => ({
  name: '',
  email: '',
  status: 'active',
  roleId: '',
});

export interface UseAddUserModalReturn {
  name: Ref<string>;
  email: Ref<string>;
  status: Ref<UserStatus>;
  roleId: Ref<string>;
  errors: ComputedRef<Partial<Record<FieldKey, string>>>;
  roleOptions: ComputedRef<SelectOption<string>[]>;
  statusOptions: SelectOption<UserStatus>[];
  handleSubmit: (event?: Event) => Promise<unknown>;
}

export function useAddUserModal(
  props: {
    open: boolean;
    roles: Role[];
    serverErrors?: Record<string, string>;
  },
  emit: {
    (event: 'close'): void;
    (event: 'submit', dto: CreateUserDto): void;
  },
): UseAddUserModalReturn {
  const validationSchema = toTypedSchema(createUserSchema);

  const form = useForm<CreateUserFormValues>({
    validationSchema,
    initialValues: initialValues(),
  });

  const { value: name } = useField<string>('name');
  const { value: email } = useField<string>('email');
  const { value: status } = useField<UserStatus>('status');
  const { value: roleId } = useField<string>('roleId');

  const errors = computed<Partial<Record<FieldKey, string>>>(() => {
    const typedErrors: Partial<Record<FieldKey, string>> = {};
    for (const key of FIELD_KEYS) {
      const message = form.errors.value[key];
      if (message) typedErrors[key] = message;
    }
    return typedErrors;
  });

  const roleOptions = computed<SelectOption<string>[]>(() =>
    props.roles.map((role) => ({ label: role.name, value: role.id })),
  );

  const statusOptions: SelectOption<UserStatus>[] = [
    { label: COPY.statusActive, value: 'active' },
    { label: COPY.statusInactive, value: 'inactive' },
  ];

  watch(
    () => props.open,
    (isOpen) => {
      if (isOpen) {
        form.resetForm({ values: initialValues() });
      }
    },
  );

  // Surface backend validation hints onto the matching VeeValidate fields.
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
    const dto: CreateUserDto = {
      name: values.name,
      email: values.email,
      status: values.status,
      roleId: values.roleId,
    };
    emit('submit', dto);
  });

  return {
    name,
    email,
    status,
    roleId,
    errors,
    roleOptions,
    statusOptions,
    handleSubmit,
  };
}
