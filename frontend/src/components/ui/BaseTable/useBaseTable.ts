import { computed, type ComputedRef } from 'vue';
import type { TableColumn } from './BaseTable.types';

export interface BaseTableResolvedProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  rows: T[];
  loading: boolean;
  rowKey?: keyof T;
}

export function useBaseTable<T extends Record<string, unknown>>(
  props: BaseTableResolvedProps<T>,
): {
  alignmentClass: (align: TableColumn<T>['align']) => string;
  showEmpty: ComputedRef<boolean>;
  getRowKey: (row: T, index: number) => string | number;
} {
  function alignmentClass(align: TableColumn<T>['align']): string {
    switch (align) {
      case 'right':
        return 'text-right';
      case 'center':
        return 'text-center';
      default:
        return 'text-left';
    }
  }

  const showEmpty = computed<boolean>(
    () => !props.loading && props.rows.length === 0,
  );

  function getRowKey(row: T, index: number): string | number {
    if (props.rowKey) {
      const value = row[props.rowKey];
      if (typeof value === 'string' || typeof value === 'number') {
        return value;
      }
    }
    return index;
  }

  return { alignmentClass, showEmpty, getRowKey };
}
