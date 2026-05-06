import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseTable from './BaseTable.vue';

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
}

describe('BaseTable', () => {
  const columns = [
    { key: 'name', label: 'Name', field: 'name' as const },
  ];

  it('renders rows', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns,
        rows: [{ id: '1', name: 'Alice' }] as Row[],
        rowKey: 'id' as const,
      },
    });
    expect(wrapper.text()).toContain('Alice');
  });

  it('shows empty state', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns,
        rows: [] as Row[],
        rowKey: 'id' as const,
        emptyMessage: 'Nothing here',
      },
    });
    expect(wrapper.text()).toContain('Nothing here');
  });

  it('shows loading message', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns,
        rows: [] as Row[],
        rowKey: 'id' as const,
        loading: true,
      },
    });
    expect(wrapper.text()).toContain('Loading');
  });
});
