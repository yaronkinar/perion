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
  args: { open: false, roles },
};
export default meta;
type Story = StoryObj<typeof AddUserModal>;

export const Playground: Story = {
  render: (args) => ({
    components: { AddUserModal },
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
        <AddUserModal v-bind="args" @close="args.open = false" />
      </div>
    `,
  }),
};
