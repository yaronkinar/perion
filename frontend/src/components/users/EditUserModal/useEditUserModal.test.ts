import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useEditUserModal } from './useEditUserModal';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/role.types';
import type { User } from '@/types/user.types';

const ROLE_ID = '11111111-1111-4111-8111-111111111111';
const roles: Role[] = [{ id: ROLE_ID, name: 'Admin', permissions: [] }];
const user: User = {
  id: 'u-1',
  name: 'Admin User',
  email: 'admin@test.com',
  status: 'active',
  role: roles[0],
};

interface Harness {
  result: ReturnType<typeof useEditUserModal>;
  emit: ReturnType<typeof vi.fn>;
  props: {
    open: boolean;
    user: User | null;
    roles: Role[];
    serverErrors?: Record<string, string>;
  };
}

function mountHarness(): Harness {
  const harness = {} as Harness;
  const props = reactive<Harness['props']>({
    open: true,
    user,
    roles,
    serverErrors: {},
  });
  const emit = vi.fn();
  harness.emit = emit;
  harness.props = props;

  const Component = defineComponent({
    setup() {
      harness.result = useEditUserModal(
        props,
        emit as unknown as Parameters<typeof useEditUserModal>[1],
      );
      return () => h('div');
    },
  });
  mount(Component);
  return harness;
}

describe('useEditUserModal (blur validation)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('validates email on blur without submit', async () => {
    const h = mountHarness();
    await nextTick();
    h.result.email.value = 'broken';
    await nextTick();

    await h.result.handleEmailBlur();
    await nextTick();

    expect(h.result.errors.value.email).toBe('Email is invalid');
    expect(h.emit).not.toHaveBeenCalled();
  });

  it('allows role changes when user has edit_user permission', async () => {
    const authStore = useAuthStore();
    authStore.setUser({
      ...user,
      permissions: ['edit_user'],
    });

    const h = mountHarness();
    await nextTick();

    expect(h.result.canChangeRole.value).toBe(true);
  });
});
