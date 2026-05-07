import type { Meta, StoryObj } from '@storybook/vue3';
import { setActivePinia, createPinia } from 'pinia';
import UsersTable from './UsersTable.vue';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/role.types';
import type { PermissionAction } from '@/types/permission.types';
import type { User, UserWithPermissions } from '@/types/user.types';

const adminRole: Role = {
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
const editorRole: Role = {
  id: 'r-editor',
  name: 'Editor',
  permissions: [
    { id: '1', name: 'view_users' },
    { id: '3', name: 'edit_user' },
    { id: '5', name: 'view_roles' },
    { id: '7', name: 'change_role' },
  ],
};
const viewerRole: Role = {
  id: 'r-viewer',
  name: 'Viewer',
  permissions: [{ id: '1', name: 'view_users' }],
};

const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@test.com',
    status: 'active',
    role: adminRole,
  },
  {
    id: '2',
    name: 'Editor User',
    email: 'editor@test.com',
    status: 'active',
    role: editorRole,
  },
  {
    id: '3',
    name: 'Viewer User',
    email: 'viewer@test.com',
    status: 'inactive',
    role: viewerRole,
  },
];

function withRole(roleName: 'Admin' | 'Editor' | 'Viewer') {
  return () => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    let permissions: PermissionAction[] = [];
    let role = adminRole;
    if (roleName === 'Admin') {
      permissions = [
        'view_users',
        'create_user',
        'edit_user',
        'delete_user',
        'view_roles',
        'edit_roles',
        'change_role',
      ];
      role = adminRole;
    } else if (roleName === 'Editor') {
      permissions = ['view_users', 'edit_user', 'view_roles', 'change_role'];
      role = editorRole;
    } else {
      permissions = ['view_users'];
      role = viewerRole;
    }
    const stub: UserWithPermissions = {
      id: 'sb',
      name: `${roleName} User`,
      email: `${roleName.toLowerCase()}@test.com`,
      status: 'active',
      role,
      permissions,
    };
    auth.setUser(stub);
    return { template: '<story />' };
  };
}

const meta: Meta<typeof UsersTable> = {
  title: 'Users/UsersTable',
  component: UsersTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
RBAC matrix reference for this table:

| UI Element | Admin | Editor | Viewer |
| --- | --- | --- | --- |
| Users table | Visible | Visible | Visible |
| Add User button | Enabled | Hidden | Hidden |
| Edit button | Enabled | Enabled | Hidden |
| Delete button | Enabled | Hidden | Hidden |
| Change Role dropdown | Enabled (inside Edit modal) | Enabled (inside Edit modal) | Hidden |
| Role column | Visible | Visible | Hidden |
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof UsersTable>;

export const AdminView: Story = {
  decorators: [withRole('Admin')],
  args: { users: sampleUsers },
};

export const EditorView: Story = {
  decorators: [withRole('Editor')],
  args: { users: sampleUsers },
};

export const ViewerView: Story = {
  decorators: [withRole('Viewer')],
  args: {
    users: sampleUsers.map(({ role: _role, ...rest }) => rest as User),
  },
};
