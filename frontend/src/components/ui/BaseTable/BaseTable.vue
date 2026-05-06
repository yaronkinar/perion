<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { TableColumn } from './BaseTable.types';
import { useBaseTable } from './useBaseTable';

interface Props {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey?: keyof T;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: 'No data to show',
  loading: false,
  loadingMessage: 'Loading...',
});

const { alignmentClass, showEmpty, getRowKey } = useBaseTable(props);
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
  >
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead class="bg-slate-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :class="[
              'px-4 py-3 font-semibold text-slate-700 uppercase tracking-wide text-xs',
              alignmentClass(column.align),
            ]"
            :style="column.width ? { width: column.width } : undefined"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-if="loading">
          <td
            :colspan="columns.length"
            class="px-4 py-10 text-center text-slate-500"
          >
            {{ loadingMessage }}
          </td>
        </tr>
        <tr v-else-if="showEmpty">
          <td
            :colspan="columns.length"
            class="px-4 py-10 text-center text-slate-500"
          >
            {{ emptyMessage }}
          </td>
        </tr>
        <tr
          v-for="(row, rowIndex) in rows"
          v-else
          :key="getRowKey(row, rowIndex)"
          class="hover:bg-slate-50"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-4 py-3 text-slate-700',
              alignmentClass(column.align),
            ]"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :column="column"
              :index="rowIndex"
            >
              <template v-if="column.field !== undefined">
                {{ row[column.field] }}
              </template>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
