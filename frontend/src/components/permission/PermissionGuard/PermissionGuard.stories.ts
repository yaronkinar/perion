import type { Meta, StoryObj } from '@storybook/vue3';
import { setActivePinia, createPinia } from 'pinia';
import PermissionGuard from './PermissionGuard.vue';
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import { useAuthStore } from '@/stores/auth.store';
import type { PermissionAction } from '@/types/permission.types';
import type { UserWithPermissions } from '@/types/user.types';

function withAuth(permissions: PermissionAction[]) {
  return () => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    const stub: UserWithPermissions = {
      id: 'storybook-user',
      name: 'Storybook User',
      email: 'sb@test.com',
      status: 'active',
      role: {
        id: 'r',
        name: 'Admin',
        permissions: permissions.map((p) => ({ id: p, name: p })),
      },
      permissions,
    };
    auth.setUser(stub);
    return { template: '<story />' };
  };
}

const meta: Meta<typeof PermissionGuard> = {
  title: 'Permission/PermissionGuard',
  component: PermissionGuard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof PermissionGuard>;

export const HideMode_HasPermission: Story = {
  decorators: [withAuth(['create_user'])],
  render: () => ({
    components: { PermissionGuard, BaseButton },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-slate-600">User has <code>create_user</code>; button is rendered.</p>
        <PermissionGuard action="create_user" mode="hide">
          <BaseButton variant="primary">Add User</BaseButton>
        </PermissionGuard>
      </div>
    `,
  }),
};

export const HideMode_NoPermission: Story = {
  decorators: [withAuth(['view_users'])],
  render: () => ({
    components: { PermissionGuard, BaseButton },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-slate-600">User lacks <code>create_user</code>; nothing is rendered.</p>
        <PermissionGuard action="create_user" mode="hide">
          <BaseButton variant="primary">Add User</BaseButton>
        </PermissionGuard>
        <p class="text-xs text-slate-400">(empty above)</p>
      </div>
    `,
  }),
};

export const DisableMode_HasPermission: Story = {
  decorators: [withAuth(['edit_roles'])],
  render: () => ({
    components: { PermissionGuard, BaseButton },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-slate-600">User has <code>edit_roles</code>; button is enabled.</p>
        <PermissionGuard action="edit_roles" mode="disable">
          <BaseButton variant="primary">Edit Role</BaseButton>
        </PermissionGuard>
      </div>
    `,
  }),
};

export const DisableMode_NoPermission: Story = {
  decorators: [withAuth(['view_roles'])],
  render: () => ({
    components: { PermissionGuard, BaseButton },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-slate-600">User lacks <code>edit_roles</code>; button stays visible but disabled.</p>
        <PermissionGuard action="edit_roles" mode="disable">
          <BaseButton variant="primary">Edit Role</BaseButton>
        </PermissionGuard>
      </div>
    `,
  }),
};
