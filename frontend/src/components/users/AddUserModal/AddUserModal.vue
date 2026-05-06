<script setup lang="ts">
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import BaseInput from '../../ui/BaseInput/BaseInput.vue';
import BaseModal from '../../ui/BaseModal/BaseModal.vue';
import BaseSelect from '../../ui/BaseSelect/BaseSelect.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import type { Role } from '@/types/role.types';
import type { CreateUserDto } from '@/types/user.types';
import { useAddUserModal } from './useAddUserModal';

interface Props {
  open: boolean;
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
  (event: 'submit', dto: CreateUserDto): void;
}>();

const {
  name,
  email,
  status,
  roleId,
  errors,
  roleOptions,
  statusOptions,
  handleSubmit,
} = useAddUserModal(props, emit);
</script>

<template>
  <BaseModal :open="open" :title="COPY.addUserTitle" @close="emit('close')">
    <form
      class="space-y-4"
      :data-test="TEST_IDS.addUserForm"
      @submit="handleSubmit"
    >
      <BaseInput
        v-model="name"
        :label="COPY.fieldName"
        required
        :error="errors.name"
        autocomplete="off"
        :data-test="TEST_IDS.addUserName"
      />
      <BaseInput
        v-model="email"
        type="email"
        :label="COPY.fieldEmail"
        required
        :error="errors.email"
        autocomplete="off"
        :data-test="TEST_IDS.addUserEmail"
      />
      <BaseSelect
        v-model="status"
        :options="statusOptions"
        :label="COPY.fieldStatus"
        required
      />
      <BaseSelect
        v-model="roleId"
        :options="roleOptions"
        :label="COPY.fieldRole"
        :placeholder="COPY.pickARole"
        required
        :error="errors.roleId"
      />
      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="default" type="button" @click="emit('close')">
          {{ COPY.cancel }}
        </BaseButton>
        <BaseButton variant="primary" type="submit" :loading="saving">
          {{ COPY.createUser }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
