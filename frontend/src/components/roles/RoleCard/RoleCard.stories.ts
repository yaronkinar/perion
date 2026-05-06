import type { Meta, StoryObj } from '@storybook/vue3';
import { setActivePinia, createPinia } from 'pinia';
import RoleCard from './RoleCard.vue';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/role.types';
import type { UserWithPermissions } from '@/types/user.types';

const admin: Role = {
  id: 'r-admin',
  name: 'Admin',
  permissions: [
    { id: '1', name: 'view_users' },
    { id: '2', name: 'create_user' },
    { id: '3', name: 'edit_user' },
    { id: '4', name: 'delete_user' },
    { id: '5', name: 'view_roles' },
    { id: '6', name: 'edit_roles' },
    { id: '7', name: 'change_role' },
  ],
};
const editor: Role = {
  id: 'r-editor',
  name: 'Editor',
  permissions: [
    { id: '1', name: 'view_users' },
    { id: '3', name: 'edit_user' },
    { id: '5', name: 'view_roles' },
    { id: '7', name: 'change_role' },
  ],
};
const viewer: Role = {
  id: 'r-viewer',
  name: 'Viewer',
  permissions: [{ id: '1', name: 'view_users' }],
};

const adminLoggedIn = (): { template: string } => {
  setActivePinia(createPinia());
  const stub: UserWithPermissions = {
    id: 'sb',
    name: 'SB',
    email: 'sb@test.com',
    status: 'active',
    role: admin,
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

const meta: Meta<typeof RoleCard> = {
  title: 'Roles/RoleCard',
  component: RoleCard,
  tags: ['autodocs'],
  decorators: [adminLoggedIn],
};
export default meta;
type Story = StoryObj<typeof RoleCard>;

export const AdminRole: Story = { args: { role: admin } };
export const EditorRole: Story = { args: { role: editor } };
export const ViewerRole: Story = { args: { role: viewer } };
