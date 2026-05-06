import type { Meta, StoryObj } from '@storybook/vue3';
import BaseBadge from './BaseBadge.vue';

const meta: Meta<typeof BaseBadge> = {
  title: 'UI/BaseBadge',
  component: BaseBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'neutral',
        'active',
        'inactive',
        'admin',
        'editor',
        'viewer',
        'permission',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseBadge>;

export const Active: Story = {
  args: { variant: 'active' },
  render: (args) => ({
    components: { BaseBadge },
    setup: () => ({ args }),
    template: '<BaseBadge v-bind="args">Active</BaseBadge>',
  }),
};

export const Inactive: Story = {
  args: { variant: 'inactive' },
  render: (args) => ({
    components: { BaseBadge },
    setup: () => ({ args }),
    template: '<BaseBadge v-bind="args">Inactive</BaseBadge>',
  }),
};

export const Admin: Story = {
  args: { variant: 'admin' },
  render: (args) => ({
    components: { BaseBadge },
    setup: () => ({ args }),
    template: '<BaseBadge v-bind="args">Admin</BaseBadge>',
  }),
};

export const Editor: Story = {
  args: { variant: 'editor' },
  render: (args) => ({
    components: { BaseBadge },
    setup: () => ({ args }),
    template: '<BaseBadge v-bind="args">Editor</BaseBadge>',
  }),
};

export const Viewer: Story = {
  args: { variant: 'viewer' },
  render: (args) => ({
    components: { BaseBadge },
    setup: () => ({ args }),
    template: '<BaseBadge v-bind="args">Viewer</BaseBadge>',
  }),
};
