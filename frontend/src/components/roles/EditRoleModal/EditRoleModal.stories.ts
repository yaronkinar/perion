import type { Meta, StoryObj } from '@storybook/vue3';
import EditRoleModal from './EditRoleModal.vue';
import type { Permission, Role } from '@/types/role.types';

const allPermissions: Permission[] = [
  { id: '1', name: 'view_users' },
  { id: '2', name: 'create_user' },
  { id: '3', name: 'edit_user' },
  { id: '4', name: 'delete_user' },
  { id: '5', name: 'view_roles' },
  { id: '6', name: 'edit_roles' },
  { id: '7', name: 'change_role' },
];

const editorRole: Role = {
  id: 'r-editor',
  name: 'Editor',
  permissions: [
    { id: '1', name: 'view_users' },
    { id: '3', name: 'edit_user' },
  ],
};

const meta: Meta<typeof EditRoleModal> = {
  title: 'Roles/EditRoleModal',
  component: EditRoleModal,
  tags: ['autodocs'],
  args: { open: true, role: editorRole, allPermissions },
};
export default meta;
type Story = StoryObj<typeof EditRoleModal>;

export const Open: Story = {};
