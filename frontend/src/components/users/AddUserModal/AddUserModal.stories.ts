import type { Meta, StoryObj } from '@storybook/vue3';
import AddUserModal from './AddUserModal.vue';
import type { Role } from '@/types/role.types';

const roles: Role[] = [
  { id: 'r-admin', name: 'Admin', permissions: [] },
  { id: 'r-editor', name: 'Editor', permissions: [] },
  { id: 'r-viewer', name: 'Viewer', permissions: [] },
];

const meta: Meta<typeof AddUserModal> = {
  title: 'Users/AddUserModal',
  component: AddUserModal,
  tags: ['autodocs'],
  args: { open: true, roles },
};
export default meta;
type Story = StoryObj<typeof AddUserModal>;

export const Open: Story = {};
