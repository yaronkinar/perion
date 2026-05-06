import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseButton from './BaseButton.vue';

describe('BaseButton', () => {
  it('renders default variant with slot content', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Click me' } });
    expect(wrapper.text()).toContain('Click me');
    expect(wrapper.attributes('type')).toBe('button');
  });

  it('emits click when not disabled', async () => {
    const wrapper = mount(BaseButton, { slots: { default: 'OK' } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(BaseButton, {
      props: { disabled: true },
      slots: { default: 'No' },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
    expect(wrapper.attributes('disabled')).toBeDefined();
  });

  it('shows loading state', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true },
      slots: { default: 'Loading' },
    });
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.attributes('disabled')).toBeDefined();
  });

  it('applies primary variant classes', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'primary' },
      slots: { default: 'X' },
    });
    expect(wrapper.classes().some((c) => c.includes('bg-brand-600'))).toBe(true);
  });
});
