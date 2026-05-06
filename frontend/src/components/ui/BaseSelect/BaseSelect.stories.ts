import type { Meta, StoryObj } from '@storybook/vue3';
import BaseSelect from './BaseSelect.vue';

type BaseSelectProps = {
  modelValue: string | null;
  options: { label: string; value: string }[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

const meta: Meta<BaseSelectProps> = {
  title: 'UI/BaseSelect',
  component: BaseSelect as unknown as Meta<BaseSelectProps>['component'],
  tags: ['autodocs'],
  args: {
    modelValue: null,
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
      { label: 'Viewer', value: 'viewer' },
    ],
  },
};

export default meta;
type Story = StoryObj<BaseSelectProps>;

export const Default: Story = {
  args: { placeholder: 'Choose a role', label: 'Role' },
};

export const WithError: Story = {
  args: { label: 'Role', error: 'Role is required' },
};

export const Disabled: Story = {
  args: { label: 'Role', disabled: true, modelValue: 'admin' },
};
