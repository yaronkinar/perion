import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseInput from './BaseInput.vue';

describe('BaseInput', () => {
  it('emits update:modelValue on input', async () => {
    const wrapper = mount(BaseInput, {
      props: { modelValue: '' },
    });
    const input = wrapper.get('input');
    await input.setValue('hello');
    const events = wrapper.emitted('update:modelValue');
    expect(events).toBeTruthy();
    expect(events?.[events.length - 1]).toEqual(['hello']);
  });

  it('renders label and required marker', () => {
    const wrapper = mount(BaseInput, {
      props: { modelValue: '', label: 'Name', required: true },
    });
    expect(wrapper.text()).toContain('Name');
    expect(wrapper.text()).toContain('*');
  });

  it('renders error and aria-invalid when error is present', () => {
    const wrapper = mount(BaseInput, {
      props: { modelValue: 'x', error: 'Bad' },
    });
    expect(wrapper.text()).toContain('Bad');
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true');
  });

  it('honors disabled', () => {
    const wrapper = mount(BaseInput, {
      props: { modelValue: '', disabled: true },
    });
    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
  });
});
