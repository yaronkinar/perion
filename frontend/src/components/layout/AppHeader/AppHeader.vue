<script setup lang="ts">

import BaseBadge from '../../ui/BaseBadge/BaseBadge.vue';

import BaseButton from '../../ui/BaseButton/BaseButton.vue';

import UiBrandMark from '@/components/ui/primitives/UiBrandMark.vue';

import UiFlex from '@/components/ui/primitives/UiFlex.vue';

import UiStickyBar from '@/components/ui/primitives/UiStickyBar.vue';

import UiText from '@/components/ui/primitives/UiText.vue';

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
  <UiStickyBar>
    <UiFlex variant="itemsStartMd">
      <UiBrandMark size="sm" />

      <UiText variant="headerTitle">{{ title ?? COPY.appTitle }}</UiText>
    </UiFlex>

    <UiFlex variant="itemsStartMd">
      <template v-if="currentUser">
        <UiFlex variant="identityRow">
          <UiText variant="headerMuted" :data-test="TEST_IDS.currentUserName">
            {{ currentUser.name }}
          </UiText>

          <BaseBadge

            v-if="currentUser.role"

            :variant="roleBadgeVariant(currentUser.role.name)"

            :data-test="TEST_IDS.currentUserRole"
          >
            {{ currentUser.role.name }}
          </BaseBadge>
        </UiFlex>

        <BaseButton

          size="sm"

          variant="ghost"

          :data-test="TEST_IDS.logoutButton"

          @click="$emit('logout')"
        >
          {{ COPY.signOut }}
        </BaseButton>
      </template>
    </UiFlex>
  </UiStickyBar>
</template>

