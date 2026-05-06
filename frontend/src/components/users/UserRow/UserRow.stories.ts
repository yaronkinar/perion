import type { Meta, StoryObj } from '@storybook/vue3';
import { setActivePinia, createPinia } from 'pinia';
import UserRow from './UserRow.vue';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/role.types';
import type { User, UserWithPermissions } from '@/types/user.types';

const adminRole: Role = {
  id: 'r-admin',
  name: 'Admin',
  permissions: [],
};

const sample: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@test.com',
  status: 'active',
  role: adminRole,
};

const adminLoggedIn = (): { template: string } => {
  setActivePinia(createPinia());
  const stub: UserWithPermissions = {
    ...sample,
    permissions: [
      'view_users',
      'create_user',
      'edit_user',
      'delete_user',
      'view_roles',
      'edit_roles',
      'change_role',
    ],
  };
  useAuthStore().setUser(stub);
  return { template: '<story />' };
};

const meta: Meta<typeof UserRow> = {
  title: 'Users/UserRow',
  component: UserRow,
  tags: ['autodocs'],
  decorators: [adminLoggedIn],
};
export default meta;
type Story = StoryObj<typeof UserRow>;

export const Default: Story = { args: { user: sample } };
export const Inactive: Story = {
  args: { user: { ...sample, status: 'inactive' } },
};
