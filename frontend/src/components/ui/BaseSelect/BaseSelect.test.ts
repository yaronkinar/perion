import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseSelect from './BaseSelect.vue';

describe('BaseSelect', () => {
  const options = [
    { label: 'Admin', value: 'admin' },
    { label: 'Editor', value: 'editor' },
  ];

  it('renders options', () => {
    const wrapper = mount(BaseSelect, {
      props: { modelValue: null, options, label: 'Role' },
    });
    expect(wrapper.findAll('option')).toHaveLength(2);
    expect(wrapper.text()).toContain('Admin');
  });

  it('emits update:modelValue with selected string', async () => {
    const wrapper = mount(BaseSelect, {
      props: { modelValue: null, options },
    });
    await wrapper.get('select').setValue('editor');
    const events = wrapper.emitted('update:modelValue');
    expect(events?.[0]).toEqual(['editor']);
  });

  it('shows error', () => {
    const wrapper = mount(BaseSelect, {
      props: { modelValue: null, options, error: 'pick one' },
    });
    expect(wrapper.text()).toContain('pick one');
    expect(wrapper.get('select').attributes('aria-invalid')).toBe('true');
  });
});
