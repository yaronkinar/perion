import { computed, watch, type ComputedRef, type Ref } from 'vue';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { SelectOption } from '../../ui/BaseSelect/BaseSelect.types';
import { COPY } from '@/constants/messages';
import { createUserSchema } from '@/schemas/user.schema';
import type { Role } from '@/types/role.types';
import type { CreateUserDto, UserStatus } from '@/types/user.types';

const FIELD_KEYS = ['name', 'email', 'status', 'roleId'] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

interface AddUserFormValues {
  name: string;
  email: string;
  status: UserStatus;
  roleId: string | null;
}

const initialValues = (): AddUserFormValues => ({
  name: '',
  email: '',
  status: 'active',
  roleId: null,
});

export interface UseAddUserModalReturn {
  name: Ref<string>;
  email: Ref<string>;
  status: Ref<UserStatus>;
  roleId: Ref<string | null>;
  errors: Ref<Partial<Record<FieldKey, string>>>;
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

  const form = useForm<AddUserFormValues>({
    validationSchema,
    initialValues: initialValues(),
  });

  const { value: name } = useField<string>('name');
  const { value: email } = useField<string>('email');
  const { value: status } = useField<UserStatus>('status');
  const { value: roleId } = useField<string | null>('roleId');

  const errors = form.errors as Ref<Partial<Record<FieldKey, string>>>;

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
    () => props.serverErrors ?? {},
    (incoming) => {
      for (const key of FIELD_KEYS) {
        const message = incoming[key];
        if (message) form.setFieldError(key, message);
      }
    },
    { deep: true },
  );

  const handleSubmit = form.handleSubmit((values) => {
    // Validation guarantees roleId is a non-null UUID at this point.
    if (!values.roleId) return;
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
