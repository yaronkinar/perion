import type { Meta, StoryObj } from '@storybook/vue3';
import BaseModal from './BaseModal.vue';
import BaseButton from '../BaseButton/BaseButton.vue';

const meta: Meta<typeof BaseModal> = {
  title: 'UI/BaseModal',
  component: BaseModal,
  tags: ['autodocs'],
  args: { open: true, title: 'Modal title' },
};

export default meta;
type Story = StoryObj<typeof BaseModal>;

export const Open: Story = {
  render: (args) => ({
    components: { BaseModal, BaseButton },
    setup: () => ({ args }),
    template: `
      <BaseModal v-bind="args" @close="args.open = false">
        <p class="text-sm text-slate-600">
          A modal dialog with header, body, and footer slots.
        </p>
        <template #footer>
          <BaseButton variant="default" @click="args.open = false">Cancel</BaseButton>
          <BaseButton variant="primary">Confirm</BaseButton>
        </template>
      </BaseModal>
    `,
  }),
};

export const Closed: Story = {
  args: { open: false },
  render: (args) => ({
    components: { BaseModal },
    setup: () => ({ args }),
    template: `
      <div class="text-sm text-slate-500">
        Modal is closed (set <code>open</code> to true to display).
        <BaseModal v-bind="args" @close="args.open = false">
          <p>Hidden content</p>
        </BaseModal>
      </div>
    `,
  }),
};
