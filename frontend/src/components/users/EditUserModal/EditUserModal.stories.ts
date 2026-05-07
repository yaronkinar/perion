import type { Meta, StoryObj } from '@storybook/vue3';
import { setActivePinia, createPinia } from 'pinia';
import EditUserModal from './EditUserModal.vue';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/role.types';
import type { User, UserWithPermissions } from '@/types/user.types';

const adminRole: Role = {
  id: 'r-admin',
  name: 'Admin',
  permissions: [],
};

const roles: Role[] = [
  adminRole,
  { id: 'r-editor', name: 'Editor', permissions: [] },
  { id: 'r-viewer', name: 'Viewer', permissions: [] },
];

const sampleUser: User = {
  id: 'u-1',
  name: 'Some User',
  email: 'some@test.com',
  status: 'active',
  role: adminRole,
};

const adminLoggedIn = (): { template: string } => {
  setActivePinia(createPinia());
  const stub: UserWithPermissions = {
    ...sampleUser,
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

const meta: Meta<typeof EditUserModal> = {
  title: 'Users/EditUserModal',
  component: EditUserModal,
  tags: ['autodocs'],
  decorators: [adminLoggedIn],
  args: { open: false, roles, user: sampleUser },
};
export default meta;
type Story = StoryObj<typeof EditUserModal>;

export const Playground: Story = {
  render: (args) => ({
    components: { EditUserModal },
    setup: () => ({ args }),
    template: `
      <div>
        <button
          type="button"
          class="mb-4 rounded bg-brand-600 px-3 py-2 text-sm font-medium text-white"
          @click="args.open = true"
        >
          Open modal
        </button>
        <EditUserModal v-bind="args" @close="args.open = false" />
      </div>
    `,
  }),
};
