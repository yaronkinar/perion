import type { Meta, StoryObj } from '@storybook/vue3';
import BaseTable from './BaseTable.vue';
import type { TableColumn } from './BaseTable.types';

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface TableArgs {
  columns: TableColumn<Row>[];
  rows: Row[];
  rowKey?: keyof Row;
  emptyMessage?: string;
  loading?: boolean;
}

const meta: Meta<TableArgs> = {
  title: 'UI/BaseTable',
  component: BaseTable as unknown as Meta<TableArgs>['component'],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TableArgs>;

const columns = [
  { key: 'name', label: 'Name', field: 'name' },
  { key: 'email', label: 'Email', field: 'email' },
  { key: 'status', label: 'Status', field: 'status' },
];

const rows: Row[] = [
  { id: '1', name: 'Admin User', email: 'admin@test.com', status: 'active' },
  { id: '2', name: 'Editor User', email: 'editor@test.com', status: 'active' },
  { id: '3', name: 'Viewer User', email: 'viewer@test.com', status: 'inactive' },
];

export const WithData: Story = {
  args: { columns, rows, rowKey: 'id' },
};

export const Empty: Story = {
  args: { columns, rows: [], rowKey: 'id', emptyMessage: 'No users found' },
};

export const Loading: Story = {
  args: { columns, rows: [], rowKey: 'id', loading: true },
};
