<script setup lang="ts">
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import BaseModal from '../../ui/BaseModal/BaseModal.vue';
import UiFlex from '@/components/ui/primitives/UiFlex.vue';
import UiStack from '@/components/ui/primitives/UiStack.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import type { User } from '@/types/user.types';

interface Props {
  open: boolean;
  user: User | null;
  saving?: boolean;
}

withDefaults(defineProps<Props>(), {
  saving: false,
});

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'confirm'): void;
}>();
</script>

<template>
  <BaseModal :open="open" :title="COPY.deleteUserTitle" @close="emit('close')">
    <UiStack gap="4">
      <UiText v-if="user" variant="modalLead" :data-test="TEST_IDS.deleteUserModalMessage">
        {{ COPY.deleteUserPrompt(user.name) }}
      </UiText>
      <UiFlex variant="formActions">
        <BaseButton
          variant="default"
          type="button"
          :disabled="saving"
          :data-test="TEST_IDS.deleteUserCancel"
          @click="emit('close')"
        >
          {{ COPY.cancel }}
        </BaseButton>
        <BaseButton
          variant="danger"
          type="button"
          :disabled="!user"
          :loading="saving"
          :data-test="TEST_IDS.deleteUserConfirm"
          @click="emit('confirm')"
        >
          {{ COPY.deleteUserConfirm }}
        </BaseButton>
      </UiFlex>
    </UiStack>
  </BaseModal>
</template>
