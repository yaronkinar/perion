<script setup lang="ts">
import { ref } from 'vue';
import UiGrid from '@/components/ui/primitives/UiGrid.vue';
import UiSurface from '@/components/ui/primitives/UiSurface.vue';
import UiTabButton from '@/components/ui/primitives/UiTabButton.vue';

export type LoginSignInTabValue = 'demo' | 'password';

const props = defineProps<{
  modelValue: LoginSignInTabValue;
  /** Accessible label for the tablist */
  tabsAriaLabel: string;
  demoLabel: string;
  passwordLabel: string;
  demoTestId: string;
  passwordTestId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: LoginSignInTabValue];
}>();

const TAB_VALUES: LoginSignInTabValue[] = ['demo', 'password'];
const TAB_IDS: Record<LoginSignInTabValue, string> = {
  demo: 'login-tab-demo',
  password: 'login-tab-password',
};
const PANEL_IDS: Record<LoginSignInTabValue, string> = {
  demo: 'login-panel-demo',
  password: 'login-panel-password',
};
const tabRefs = ref<Array<HTMLButtonElement | null>>([]);

function select(next: LoginSignInTabValue): void {
  emit('update:modelValue', next);
}

function focusAndSelect(next: LoginSignInTabValue): void {
  select(next);
  const nextIdx = TAB_VALUES.indexOf(next);
  tabRefs.value[nextIdx]?.focus();
}

function onTabKeydown(current: LoginSignInTabValue, event: KeyboardEvent): void {
  const currentIdx = TAB_VALUES.indexOf(current);
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    const nextIdx = (currentIdx + 1) % TAB_VALUES.length;
    focusAndSelect(TAB_VALUES[nextIdx]);
    return;
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    const nextIdx = (currentIdx - 1 + TAB_VALUES.length) % TAB_VALUES.length;
    focusAndSelect(TAB_VALUES[nextIdx]);
    return;
  }
  if (event.key === 'Home') {
    event.preventDefault();
    focusAndSelect(TAB_VALUES[0]);
    return;
  }
  if (event.key === 'End') {
    event.preventDefault();
    focusAndSelect(TAB_VALUES[TAB_VALUES.length - 1]);
  }
}
</script>

<template>
  <UiSurface variant="tabShell" role="tablist" :aria-label="props.tabsAriaLabel">
    <UiGrid variant="tabs">
      <UiTabButton
        :id="TAB_IDS.demo"
        :ref="(el) => (tabRefs[0] = el as HTMLButtonElement | null)"
        :controls="PANEL_IDS.demo"
        :selected="props.modelValue === 'demo'"
        :tab-index="props.modelValue === 'demo' ? 0 : -1"
        :data-test="props.demoTestId"
        @click="select('demo')"
        @keydown="onTabKeydown('demo', $event)"
      >
        {{ props.demoLabel }}
      </UiTabButton>
      <UiTabButton
        :id="TAB_IDS.password"
        :ref="(el) => (tabRefs[1] = el as HTMLButtonElement | null)"
        :controls="PANEL_IDS.password"
        :selected="props.modelValue === 'password'"
        :tab-index="props.modelValue === 'password' ? 0 : -1"
        :data-test="props.passwordTestId"
        @click="select('password')"
        @keydown="onTabKeydown('password', $event)"
      >
        {{ props.passwordLabel }}
      </UiTabButton>
    </UiGrid>
  </UiSurface>
</template>
