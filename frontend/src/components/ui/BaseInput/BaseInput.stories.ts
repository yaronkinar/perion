import type { Meta, StoryObj } from '@storybook/vue3';
import BaseInput from './BaseInput.vue';

const meta: Meta<typeof BaseInput> = {
  title: 'UI/BaseInput',
  component: BaseInput,
  tags: ['autodocs'],
  args: { modelValue: '' },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password'] },
  },
};

export default meta;
type Story = StoryObj<typeof BaseInput>;

export const Default: Story = {
  args: { placeholder: 'Type something...' },
};

export const WithLabel: Story = {
  args: { label: 'Email address', placeholder: 'you@example.com' },
};

export const WithError: Story = {
  args: {
    label: 'Email address',
    modelValue: 'invalid',
    error: 'Please enter a valid email',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Read only',
    modelValue: 'Locked value',
    disabled: true,
  },
};
