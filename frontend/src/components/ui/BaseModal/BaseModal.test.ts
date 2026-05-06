import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import BaseModal from './BaseModal.vue';

describe('BaseModal', () => {
  it('renders nothing when closed', () => {
    const wrapper = mount(BaseModal, {
      props: { open: false, title: 'Hi' },
      global: { stubs: { teleport: true } },
    });
    expect(wrapper.text()).not.toContain('Hi');
  });

  it('renders title and slot when open', () => {
    const wrapper = mount(BaseModal, {
      props: { open: true, title: 'Hi' },
      slots: { default: '<p>body</p>' },
      global: { stubs: { teleport: true } },
    });
    expect(wrapper.text()).toContain('Hi');
    expect(wrapper.html()).toContain('body');
  });

  it('emits close when close button clicked', async () => {
    const wrapper = mount(BaseModal, {
      props: { open: true, title: 'Hi' },
      global: { stubs: { teleport: true } },
    });
    await wrapper.get('button[aria-label="Close"]').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close on backdrop click when closeOnBackdrop is true', async () => {
    const wrapper = mount(BaseModal, {
      props: { open: true, title: 'Hi', closeOnBackdrop: true },
      global: { stubs: { teleport: true } },
    });
    await wrapper.get('[data-test="modal-backdrop"]').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('links the title via aria-labelledby', () => {
    const wrapper = mount(BaseModal, {
      props: { open: true, title: 'Confirm action' },
      global: { stubs: { teleport: true } },
    });
    const dialog = wrapper.get('[role="dialog"]');
    const labelledBy = dialog.attributes('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(wrapper.get(`#${labelledBy}`).text()).toBe('Confirm action');
  });

  it('moves focus inside the panel after opening', async () => {
    document.body.innerHTML = '';
    const wrapper = mount(BaseModal, {
      attachTo: document.body,
      props: { open: true, title: 'Hi' },
      slots: {
        default: '<button data-test="first-button">First</button>',
      },
    });
    await nextTick();
    await new Promise((r) => queueMicrotask(() => r(undefined)));
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(document.activeElement).not.toBe(document.body);
    expect(dialog?.contains(document.activeElement)).toBe(true);
    wrapper.unmount();
  });
});
