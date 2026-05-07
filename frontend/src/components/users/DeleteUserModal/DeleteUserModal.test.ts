import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DeleteUserModal from './DeleteUserModal.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import type { User } from '@/types/user.types';

const user: User = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Ada Lovelace',
  email: 'ada@test.com',
  status: 'active',
};

function mountModal(props: Partial<InstanceType<typeof DeleteUserModal>['$props']> = {}) {
  return mount(DeleteUserModal, {
    props: {
      open: true,
      user,
      saving: false,
      ...props,
    },
    global: {
      stubs: {
        teleport: true,
      },
    },
  });
}

describe('DeleteUserModal', () => {
  it('renders confirmation copy for the selected user', () => {
    const wrapper = mountModal();
    expect(wrapper.text()).toContain(COPY.deleteUserTitle);
    expect(wrapper.get(`[data-test="${TEST_IDS.deleteUserModalMessage}"]`).text()).toContain(
      COPY.deleteUserPrompt(user.name),
    );
  });

  it('keeps the confirm button disabled when there is no user', () => {
    const wrapper = mountModal({ user: null });
    expect(wrapper.find(`[data-test="${TEST_IDS.deleteUserModalMessage}"]`).exists()).toBe(false);
    expect(wrapper.get(`[data-test="${TEST_IDS.deleteUserConfirm}"]`).attributes('disabled')).toBeDefined();
  });

  it('emits close when cancel is clicked', async () => {
    const wrapper = mountModal();
    await wrapper.get(`[data-test="${TEST_IDS.deleteUserCancel}"]`).trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('confirm')).toBeFalsy();
  });

  it('emits close when BaseModal emits close', async () => {
    const wrapper = mountModal();
    wrapper.findComponent({ name: 'BaseModal' }).vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits confirm and sets loading state while saving', async () => {
    const savingWrapper = mountModal({ saving: true });
    expect(wrapperButtonDisabled(savingWrapper, TEST_IDS.deleteUserCancel)).toBe(true);
    const confirmButton = savingWrapper.get(`[data-test="${TEST_IDS.deleteUserConfirm}"]`);
    expect(confirmButton.attributes('aria-busy')).toBe('true');
    expect(confirmButton.attributes('disabled')).toBeDefined();

    const wrapper = mountModal();
    await wrapper.get(`[data-test="${TEST_IDS.deleteUserConfirm}"]`).trigger('click');
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });
});

function wrapperButtonDisabled(
  wrapper: ReturnType<typeof mountModal>,
  testId: string,
): boolean {
  return wrapper.get(`[data-test="${testId}"]`).attributes('disabled') !== undefined;
}
