<script setup lang="ts">
import UiBrandMark from '@/components/ui/primitives/UiBrandMark.vue';
import UiCenter from '@/components/ui/primitives/UiCenter.vue';
import UiText from '@/components/ui/primitives/UiText.vue';

defineProps<{
  heading: string;
  subheading: string;
}>();
</script>

<template>
  <UiCenter>
    <UiBrandMark size="lg" />
    <UiText variant="heroTitle">{{ heading }}</UiText>
    <UiText variant="heroSubtitle">{{ subheading }}</UiText>
  </UiCenter>
</template>
