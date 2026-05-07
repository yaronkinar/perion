<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import UiPageCenter from '@/components/ui/primitives/UiPageCenter.vue';
import UiSurface from '@/components/ui/primitives/UiSurface.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import { useLoginPage } from './useLoginPage';

const LoginBrandHeader = defineAsyncComponent(
  () => import('@/components/login/LoginBrandHeader/LoginBrandHeader.vue'),
);
const LoginDemoSignIn = defineAsyncComponent(
  () => import('@/components/login/LoginDemoSignIn/LoginDemoSignIn.vue'),
);
const LoginPasswordSignIn = defineAsyncComponent(
  () => import('@/components/login/LoginPasswordSignIn/LoginPasswordSignIn.vue'),
);
const LoginSignInTabs = defineAsyncComponent(
  () => import('@/components/login/LoginSignInTabs/LoginSignInTabs.vue'),
);

const {
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
} = useLoginPage();

const hasDemoUsers = computed(() => availableUsers.value.length > 0);
</script>

<template>
  <Suspense>
    <UiPageCenter stack-gap="6">
      <LoginBrandHeader
        :heading="COPY.loginHeading"
        :subheading="COPY.loginSubheading"
      />

      <LoginSignInTabs
        :model-value="mode"
        :tabs-aria-label="COPY.signIn"
        :demo-label="COPY.loginTabDemo"
        :password-label="COPY.loginTabPassword"
        :demo-test-id="TEST_IDS.loginTabDemo"
        :password-test-id="TEST_IDS.loginTabPassword"
        @update:model-value="setMode"
      />

      <div
        v-if="mode === 'demo'"
        id="login-panel-demo"
        role="tabpanel"
        aria-labelledby="login-tab-demo"
        tabindex="0"
      >
        <LoginDemoSignIn
          v-model:selected-user-id="selectedUserId"
          :loading="loading"
          :error="error"
          :has-users="hasDemoUsers"
          :user-options="userOptions"
          :selected-user="selectedUser"
          :submitting="submitting"
          :badge-variant="badgeVariant"
          @submit="handleSubmit"
        />
      </div>

      <div
        v-else
        id="login-panel-password"
        role="tabpanel"
        aria-labelledby="login-tab-password"
        tabindex="0"
      >
        <LoginPasswordSignIn
          v-model:email="passwordEmail"
          v-model:password="passwordPassword"
          :errors="passwordErrors"
          :submitting="passwordSubmitting"
          :server-error="passwordError"
          @email-blur="handlePasswordEmailBlur"
          @password-blur="handlePasswordBlur"
          @password-input="handlePasswordInput"
          @submit="handlePasswordSubmit"
        />
      </div>
    </UiPageCenter>

    <template #fallback>
      <UiPageCenter stack-gap="6">
        <UiSurface variant="elevated">
          <UiText variant="sectionDescription">Loading sign-in experience...</UiText>
        </UiSurface>
      </UiPageCenter>
    </template>
  </Suspense>
</template>

