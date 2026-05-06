<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
import BaseSelect from '@/components/ui/BaseSelect/BaseSelect.vue';
import UiDestructiveAlert from '@/components/ui/primitives/UiDestructiveAlert.vue';
import UiFlex from '@/components/ui/primitives/UiFlex.vue';
import UiSurface from '@/components/ui/primitives/UiSurface.vue';
import UiStack from '@/components/ui/primitives/UiStack.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
import type { SelectOption } from '@/components/ui/BaseSelect/BaseSelect.types';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import type { RoleBadgeVariant } from '@/constants/roles';
import type { PublicUserSummary } from '@/types';

defineProps<{
  loading: boolean;
  /** List fetch / session error message */
  error: string | null;
  hasUsers: boolean;
  userOptions: SelectOption<string>[];
  selectedUser: PublicUserSummary | null;
  submitting: boolean;
  badgeVariant: (roleName: string) => RoleBadgeVariant;
}>();

const selectedUserId = defineModel<string | null>('selectedUserId', {
  required: true,
});

const emit = defineEmits<{
  submit: [event: Event];
}>();

function onSubmit(event: Event): void {
  emit('submit', event);
}
</script>

<template>
  <UiSurface v-if="loading" variant="muted">
    {{ COPY.loadingUsers }}
  </UiSurface>

  <UiDestructiveAlert
    v-else-if="!hasUsers && error"
    :message="error"
  />

  <UiSurface v-else-if="!hasUsers" variant="muted">
    {{ COPY.noUsersAvailable }}
  </UiSurface>

  <UiSurface v-else variant="elevated">
    <UiStack gap="4">
      <UiDestructiveAlert
        v-if="error"
        :message="error"
        density="compact"
      />
      <form
        :data-test="TEST_IDS.loginForm"
        @submit="onSubmit"
      >
        <UiStack gap="4">
          <BaseSelect
            v-model="selectedUserId"
            :options="userOptions"
            :label="COPY.signInAs"
            :placeholder="COPY.selectAUser"
            required
            :data-test="TEST_IDS.userSelector"
          />

          <UiSurface
            v-if="selectedUser"
            variant="inset"
            :data-test-selected-email="selectedUser.email"
          >
            <UiFlex variant="contentBetween">
              <div>
                <UiText variant="strongSm">{{ selectedUser.name }}</UiText>
                <UiText variant="mutedXs">{{ selectedUser.email }}</UiText>
              </div>
              <BaseBadge :variant="badgeVariant(selectedUser.roleName)">
                {{ selectedUser.roleName }}
              </BaseBadge>
            </UiFlex>
          </UiSurface>

          <BaseButton
            variant="primary"
            type="submit"
            block
            :loading="submitting"
            :disabled="!selectedUserId"
            :data-test="TEST_IDS.loginSubmit"
          >
            {{ COPY.signIn }}
          </BaseButton>
        </UiStack>
      </form>
    </UiStack>
  </UiSurface>
</template>
