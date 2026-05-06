import type { Meta, StoryObj } from '@storybook/vue3';
import PermissionBadge from './PermissionBadge.vue';

const meta: Meta<typeof PermissionBadge> = {
  title: 'Permission/PermissionBadge',
  component: PermissionBadge,
  tags: ['autodocs'],
  argTypes: {
    action: {
      control: 'select',
      options: [
        'view_users',
        'create_user',
        'edit_user',
        'delete_user',
        'view_roles',
        'edit_roles',
        'change_role',
      ],
    },
  },
};
export default meta;
type Story = StoryObj<typeof PermissionBadge>;

export const ViewUsers: Story = { args: { action: 'view_users' } };
export const CreateUser: Story = { args: { action: 'create_user' } };
export const EditRoles: Story = { args: { action: 'edit_roles' } };
