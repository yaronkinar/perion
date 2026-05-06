import type { Meta, StoryObj } from '@storybook/vue3';
import { setActivePinia, createPinia } from 'pinia';
import RolesList from './RolesList.vue';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/role.types';
import type { UserWithPermissions } from '@/types/user.types';

const roles: Role[] = [
  {
    id: 'r-admin',
    name: 'Admin',
    permissions: [
      { id: '1', name: 'view_users' },
      { id: '2', name: 'create_user' },
    ],
  },
  {
    id: 'r-editor',
    name: 'Editor',
    permissions: [{ id: '1', name: 'view_users' }],
  },
  {
    id: 'r-viewer',
    name: 'Viewer',
    permissions: [{ id: '1', name: 'view_users' }],
  },
];

const adminLoggedIn = (): { template: string } => {
  setActivePinia(createPinia());
  const stub: UserWithPermissions = {
    id: 'sb',
    name: 'SB',
    email: 'sb@test.com',
    status: 'active',
    role: roles[0],
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

const meta: Meta<typeof RolesList> = {
  title: 'Roles/RolesList',
  component: RolesList,
  tags: ['autodocs'],
  decorators: [adminLoggedIn],
};
export default meta;
type Story = StoryObj<typeof RolesList>;

export const Default: Story = { args: { roles } };
export const Empty: Story = { args: { roles: [] } };
export const Loading: Story = { args: { roles: [], loading: true } };
