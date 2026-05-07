<script setup lang="ts">
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import BaseInput from '../../ui/BaseInput/BaseInput.vue';
import BaseModal from '../../ui/BaseModal/BaseModal.vue';
import BaseSelect from '../../ui/BaseSelect/BaseSelect.vue';
import UiFlex from '@/components/ui/primitives/UiFlex.vue';
import UiStack from '@/components/ui/primitives/UiStack.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import type { Role } from '@/types/role.types';
import type { UpdateUserDto, User } from '@/types/user.types';
import { useEditUserModal } from './useEditUserModal';

interface Props {
  open: boolean;
  user: User | null;
  roles: Role[];
  saving?: boolean;
  serverErrors?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
  serverErrors: () => ({}),
});

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'submit', payload: { id: string; dto: UpdateUserDto }): void;
}>();

const {
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
} = useEditUserModal(props, emit);
</script>

<template>
  <BaseModal :open="open" :title="COPY.editUserTitle" @close="emit('close')">
    <form
      v-if="user"
      :data-test="TEST_IDS.editUserForm"
      @submit="handleSubmit"
    >
      <UiStack gap="4">
        <BaseInput
          v-model="name"
          :label="COPY.fieldName"
          required
          :error="errors.name"
          autocomplete="off"
        />
        <BaseInput
          v-model="email"
          type="email"
          :label="COPY.fieldEmail"
          required
          :error="errors.email"
          autocomplete="off"
          @blur="handleEmailBlur"
        />
        <BaseSelect
          v-model="status"
          :options="statusOptions"
          :label="COPY.fieldStatus"
        />
        <BaseSelect
          v-model="roleId"
          :options="roleOptions"
          :label="COPY.fieldRole"
          :error="errors.roleId"
          :disabled="!canChangeRole"
        />
        <UiText v-if="!canChangeRole" variant="modalHint">
          {{ COPY.cannotChangeRoles }}
        </UiText>
        <UiFlex variant="formActions">
          <BaseButton variant="default" type="button" :disabled="saving" @click="emit('close')">
            {{ COPY.cancel }}
          </BaseButton>
          <BaseButton variant="primary" type="submit" :loading="saving">
            {{ COPY.saveChanges }}
          </BaseButton>
        </UiFlex>
      </UiStack>
    </form>
  </BaseModal>
</template>
