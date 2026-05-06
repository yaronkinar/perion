<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
import { useAuthStore } from '@/stores/auth.store';
import { COPY, ROUTE_NAMES } from '@/constants/messages';

const router = useRouter();
const auth = useAuthStore();
const { isAuthenticated } = storeToRefs(auth);

const targetRoute = computed<string>(() =>
  isAuthenticated.value ? ROUTE_NAMES.DASHBOARD : ROUTE_NAMES.LOGIN,
);
const ctaLabel = computed<string>(() =>
  isAuthenticated.value ? COPY.backToDashboard : COPY.backToLogin,
);

function goBack(): void {
  void router.push({ name: targetRoute.value });
}
</script>

<template>
  <div class="flex min-h-full items-center justify-center px-4 py-12">
    <div class="w-full max-w-md space-y-4 text-center">
      <h1 class="text-2xl font-semibold text-slate-900">
        {{ COPY.notFoundTitle }}
      </h1>
      <p class="text-sm text-slate-600">
        {{ COPY.notFoundSubtitle }}
      </p>
      <BaseButton variant="primary" data-test="not-found-cta" @click="goBack">
        {{ ctaLabel }}
      </BaseButton>
    </div>
  </div>
</template>
