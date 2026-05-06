<script setup lang="ts">
import BaseBadge from '../../ui/BaseBadge/BaseBadge.vue';
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import { roleBadgeVariant } from '@/constants/roles';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import { useAppHeader } from './useAppHeader';

defineProps<{ title?: string }>();

defineEmits<{
  (event: 'logout'): void;
}>();

const { currentUser } = useAppHeader();
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur"
  >
    <div class="flex items-center gap-3">
      <span
        class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white"
        aria-hidden="true"
      >
        P
      </span>
      <h1 class="text-base font-semibold text-slate-900">
        {{ title ?? COPY.appTitle }}
      </h1>
    </div>
    <div class="flex items-center gap-3">
      <template v-if="currentUser">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-slate-700" :data-test="TEST_IDS.currentUserName">
            {{ currentUser.name }}
          </span>
          <BaseBadge
            v-if="currentUser.role"
            :variant="roleBadgeVariant(currentUser.role.name)"
            :data-test="TEST_IDS.currentUserRole"
          >
            {{ currentUser.role.name }}
          </BaseBadge>
        </div>
        <BaseButton
          size="sm"
          variant="ghost"
          :data-test="TEST_IDS.logoutButton"
          @click="$emit('logout')"
        >
          {{ COPY.signOut }}
        </BaseButton>
      </template>
    </div>
  </header>
</template>
