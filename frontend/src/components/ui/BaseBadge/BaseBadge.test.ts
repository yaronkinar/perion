import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseBadge from './BaseBadge.vue';

describe('BaseBadge', () => {
  it('renders slot content', () => {
    const wrapper = mount(BaseBadge, { slots: { default: 'Active' } });
    expect(wrapper.text()).toBe('Active');
  });

  it('applies variant classes', () => {
    const wrapper = mount(BaseBadge, {
      props: { variant: 'admin' },
      slots: { default: 'Admin' },
    });
    expect(
      wrapper.classes().some((c) => c.includes('bg-brand-50')),
    ).toBe(true);
  });
});
