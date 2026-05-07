<script setup lang="ts">
import { watch } from 'vue';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput/BaseInput.vue';
import UiDestructiveAlert from '@/components/ui/primitives/UiDestructiveAlert.vue';
import UiSurface from '@/components/ui/primitives/UiSurface.vue';
import UiStack from '@/components/ui/primitives/UiStack.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import type { LoginFormValues } from '@/schemas/login.schema';

defineProps<{
  errors: Partial<Record<keyof LoginFormValues, string>>;
  submitting: boolean;
  serverError: string | null;
}>();

const email = defineModel<string>('email', { required: true });
const password = defineModel<string>('password', { required: true });

const emit = defineEmits<{
  submit: [event?: Event];
  emailBlur: [event?: FocusEvent];
  passwordBlur: [event?: FocusEvent];
  passwordInput: [];
}>();

function onSubmit(event?: Event): void {
  emit('submit', event);
}

watch(password, () => {
  emit('passwordInput');
});
</script>

<template>
  <UiSurface
    variant="elevated"
    as="form"
    :data-test="TEST_IDS.loginPasswordForm"
    novalidate
    @submit="onSubmit"
  >
    <UiStack gap="4">
      <BaseInput
        v-model="email"
        type="email"
        :label="COPY.loginEmailLabel"
        :placeholder="COPY.loginEmailPlaceholder"
        :error="errors.email"
        autocomplete="email"
        required
        :data-test="TEST_IDS.loginEmailInput"
        @blur="(event) => emit('emailBlur', event)"
      />
      <BaseInput
        v-model="password"
        type="password"
        :show-password-toggle="true"
        :show-password-label="COPY.showPassword"
        :hide-password-label="COPY.hidePassword"
        :password-toggle-test-id="TEST_IDS.loginPasswordVisibility"
        :label="COPY.loginPasswordLabel"
        :placeholder="COPY.loginPasswordPlaceholder"
        :error="errors.password"
        autocomplete="current-password"
        required
        :data-test="TEST_IDS.loginPasswordInput"
        @blur="(event) => emit('passwordBlur', event)"
      />
      <UiDestructiveAlert
        v-if="serverError"
        density="compactXs"
        :message="serverError"
      />
      <BaseButton
        variant="primary"
        type="submit"
        block
        :loading="submitting"
        :data-test="TEST_IDS.loginPasswordSubmit"
      >
        {{ COPY.signIn }}
      </BaseButton>
      <UiText variant="captionCenter">{{ COPY.loginSeedHint }}</UiText>
    </UiStack>
  </UiSurface>
</template>
