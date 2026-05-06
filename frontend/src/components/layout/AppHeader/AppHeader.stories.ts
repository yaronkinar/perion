import type { Meta, StoryObj } from '@storybook/vue3';
import { setActivePinia, createPinia } from 'pinia';
import AppHeader from './AppHeader.vue';
import { useAuthStore } from '@/stores/auth.store';
import type { UserWithPermissions } from '@/types/user.types';

const setup = (
  user: UserWithPermissions | null,
): { template: string } => {
  setActivePinia(createPinia());
  useAuthStore().setUser(user);
  return { template: '<story />' };
};

const adminUser: UserWithPermissions = {
  id: 'u1',
  name: 'Admin User',
  email: 'admin@test.com',
  status: 'active',
  role: {
    id: 'r-admin',
    name: 'Admin',
    permissions: [],
  },
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

const meta: Meta<typeof AppHeader> = {
  title: 'Layout/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AppHeader>;

export const SignedIn: Story = {
  decorators: [() => setup(adminUser)],
};
export const SignedOut: Story = {
  decorators: [() => setup(null)],
};
