<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect/BaseSelect.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import { useLoginPage } from './useLoginPage';

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
  handlePasswordSubmit,
} = useLoginPage();
</script>

<template>
  <div class="flex min-h-full items-center justify-center px-4 py-12">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <span
          class="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-md"
          aria-hidden="true"
        >
          P
        </span>
        <h1 class="mt-4 text-2xl font-semibold text-slate-900">
          {{ COPY.loginHeading }}
        </h1>
        <p class="mt-1 text-sm text-slate-600">
          {{ COPY.loginSubheading }}
        </p>
      </div>

      <div
        class="rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
        role="tablist"
        :aria-label="COPY.signIn"
      >
        <div class="grid grid-cols-2 gap-1">
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'demo'"
            :class="[
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              mode === 'demo'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100',
            ]"
            :data-test="TEST_IDS.loginTabDemo"
            @click="setMode('demo')"
          >
            {{ COPY.loginTabDemo }}
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'password'"
            :class="[
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              mode === 'password'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100',
            ]"
            :data-test="TEST_IDS.loginTabPassword"
            @click="setMode('password')"
          >
            {{ COPY.loginTabPassword }}
          </button>
        </div>
      </div>

      <!-- Demo: pick a user -->
      <template v-if="mode === 'demo'">
        <div
          v-if="loading"
          class="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
        >
          {{ COPY.loadingUsers }}
        </div>

        <!-- List fetch failed — nothing to pick yet -->
        <div
          v-else-if="availableUsers.length === 0 && error"
          class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          role="alert"
        >
          {{ error }}
        </div>

        <div
          v-else-if="availableUsers.length === 0"
          class="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
        >
          {{ COPY.noUsersAvailable }}
        </div>

        <!-- Users loaded: keep selector usable even when a session/demo error exists -->
        <div
          v-else
          class="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div
            v-if="error"
            class="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            role="alert"
          >
            {{ error }}
          </div>
          <form
            :data-test="TEST_IDS.loginForm"
            class="space-y-4"
            @submit="handleSubmit"
          >
            <BaseSelect
              v-model="selectedUserId"
              :options="userOptions"
              :label="COPY.signInAs"
              :placeholder="COPY.selectAUser"
              required
              :data-test="TEST_IDS.userSelector"
            />

            <div
              v-if="selectedUser"
              class="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
              :data-test-selected-email="selectedUser.email"
            >
              <div>
                <p class="font-medium text-slate-900">{{ selectedUser.name }}</p>
                <p class="text-xs text-slate-500">{{ selectedUser.email }}</p>
              </div>
              <BaseBadge :variant="badgeVariant(selectedUser.roleName)">
                {{ selectedUser.roleName }}
              </BaseBadge>
            </div>

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
          </form>
        </div>
      </template>

      <!-- Password: email + password (JWT) -->
      <template v-else>
        <form
          class="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          :data-test="TEST_IDS.loginPasswordForm"
          novalidate
          @submit="handlePasswordSubmit"
        >
          <BaseInput
            v-model="passwordEmail"
            type="email"
            :label="COPY.loginEmailLabel"
            :placeholder="COPY.loginEmailPlaceholder"
            :error="passwordErrors.email"
            autocomplete="email"
            required
            :data-test="TEST_IDS.loginEmailInput"
          />
          <BaseInput
            v-model="passwordPassword"
            type="password"
            :label="COPY.loginPasswordLabel"
            :placeholder="COPY.loginPasswordPlaceholder"
            :error="passwordErrors.password"
            autocomplete="current-password"
            required
            :data-test="TEST_IDS.loginPasswordInput"
          />

          <p
            v-if="passwordError"
            class="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
            role="alert"
          >
            {{ passwordError }}
          </p>

          <BaseButton
            variant="primary"
            type="submit"
            block
            :loading="passwordSubmitting"
            :data-test="TEST_IDS.loginPasswordSubmit"
          >
            {{ COPY.signIn }}
          </BaseButton>

          <p class="text-center text-xs text-slate-500">
            {{ COPY.loginSeedHint }}
          </p>
        </form>
      </template>
    </div>
  </div>
</template>
