import { computed } from 'vue';
import type { TableColumn } from '../../ui/BaseTable/BaseTable.types';
import { usePermission } from '@/composables/usePermission';
import type { User } from '@/types/user.types';

const COLUMN_LABELS = {
  name: 'Name',
  email: 'Email',
  status: 'Status',
  role: 'Role',
  actions: 'Actions',
  emRowFallback: '—',
  emptyMessage: 'No users found',
} as const;

export { COLUMN_LABELS as USERS_TABLE_COLUMN_LABELS };

export function useUsersTable() {
  const { can } = usePermission();

  const showRoleColumn = computed<boolean>(() => can('view_roles'));
  const showActionsColumn = computed<boolean>(
    () => can('edit_user') || can('delete_user'),
  );

  const columns = computed<TableColumn<User & Record<string, unknown>>[]>(() => {
    const cols: TableColumn<User & Record<string, unknown>>[] = [
      { key: 'name', label: COLUMN_LABELS.name, field: 'name' },
      { key: 'email', label: COLUMN_LABELS.email, field: 'email' },
      { key: 'status', label: COLUMN_LABELS.status },
    ];
    if (showRoleColumn.value) {
      cols.push({ key: 'role', label: COLUMN_LABELS.role });
    }
    if (showActionsColumn.value) {
      cols.push({
        key: 'actions',
        label: COLUMN_LABELS.actions,
        align: 'right',
      });
    }
    return cols;
  });

  return { showRoleColumn, showActionsColumn, columns };
}
