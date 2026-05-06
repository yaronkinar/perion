<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
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
        v-if="loading"
        class="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
      >
        {{ COPY.loadingUsers }}
      </div>

      <div
        v-else-if="error"
        class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        role="alert"
      >
        {{ error }}
      </div>

      <form
        v-else-if="availableUsers.length > 0"
        class="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        :data-test="TEST_IDS.loginForm"
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

      <div
        v-else
        class="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
      >
        {{ COPY.noUsersAvailable }}
      </div>
    </div>
  </div>
</template>
