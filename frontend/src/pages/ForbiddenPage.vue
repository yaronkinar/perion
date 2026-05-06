<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
import UiPageCenter from '@/components/ui/primitives/UiPageCenter.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
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
  <UiPageCenter stack-gap="4" content-align="center">
    <UiText variant="pageTitle">{{ COPY.forbiddenTitle }}</UiText>
    <UiText variant="pageDescription">{{ COPY.forbiddenSubtitle }}</UiText>
    <div>
      <BaseButton variant="primary" data-test="forbidden-cta" @click="goBack">
        {{ ctaLabel }}
      </BaseButton>
    </div>
  </UiPageCenter>
</template>
