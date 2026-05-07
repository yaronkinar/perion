<script setup lang="ts">

import BaseButton from '../../ui/BaseButton/BaseButton.vue';

import BaseModal from '../../ui/BaseModal/BaseModal.vue';

import UiFlex from '@/components/ui/primitives/UiFlex.vue';

import UiGrid from '@/components/ui/primitives/UiGrid.vue';

import UiPermissionCheckRow from '@/components/ui/primitives/UiPermissionCheckRow.vue';

import UiStack from '@/components/ui/primitives/UiStack.vue';

import UiText from '@/components/ui/primitives/UiText.vue';

import { permissionLabel } from '@/constants/permissions';

import { COPY } from '@/constants/messages';

import { TEST_IDS } from '@/constants/test-ids';

import type { Permission, Role, UpdateRoleDto } from '@/types/role.types';

import { useEditRoleModal } from './useEditRoleModal';



interface Props {

  open: boolean;

  role: Role | null;

  allPermissions: Permission[];

  saving?: boolean;

}



const props = withDefaults(defineProps<Props>(), { saving: false });



const emit = defineEmits<{

  (event: 'close'): void;

  (event: 'submit', payload: { id: string; dto: UpdateRoleDto }): void;

}>();



const {

  selected,

  orderedPermissions,

  modalTitle,

  toggle,

  handleSubmit,

} = useEditRoleModal(props, emit);

</script>



<template>
  <BaseModal :open="open" :title="modalTitle" @close="emit('close')">
    <form

      v-if="role"

      :data-test="TEST_IDS.editRoleForm"

      @submit="handleSubmit"
    >
      <UiStack gap="4">
        <UiText variant="modalLead">
          {{ COPY.editRoleHint(role.name) }}
        </UiText>

        <UiGrid variant="permissions" as="ul" :data-test="TEST_IDS.permissionList">
          <UiPermissionCheckRow

            v-for="permission in orderedPermissions"

            :key="permission.id"

            :input-id="`perm-${permission.id}`"

            :checked="selected.has(permission.id)"

            @change="toggle(permission.id)"
          >
            {{ permissionLabel(permission.name) }}
          </UiPermissionCheckRow>
        </UiGrid>

        <UiFlex variant="formActions">
          <BaseButton variant="default" type="button" :disabled="saving" @click="emit('close')">
            {{ COPY.cancel }}
          </BaseButton>

          <BaseButton variant="primary" type="submit" :loading="saving">
            {{ COPY.save }}
          </BaseButton>
        </UiFlex>
      </UiStack>
    </form>
  </BaseModal>
</template>

