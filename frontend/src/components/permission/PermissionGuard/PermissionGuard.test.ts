import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PermissionGuard from './PermissionGuard.vue';
import BaseButton from '../../ui/BaseButton/BaseButton.vue';
import { useAuthStore } from '@/stores/auth.store';
import type { PermissionAction } from '@/types/permission.types';
import type { UserWithPermissions } from '@/types/user.types';

function loginAs(permissions: PermissionAction[]): void {
  const store = useAuthStore();
  const stub: UserWithPermissions = {
    id: 'u',
    name: 'Tester',
    email: 'tester@test.com',
    status: 'active',
    role: {
      id: 'r',
      name: 'Admin',
      permissions: permissions.map((p) => ({ id: p, name: p })),
    },
    permissions,
  };
  store.setUser(stub);
}

describe('PermissionGuard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('hides slot when permission missing in hide mode', () => {
    loginAs(['view_users']);
    const wrapper = mount(PermissionGuard, {
      props: { action: 'create_user', mode: 'hide' },
      slots: {
        default: '<button data-test="add">Add</button>',
      },
    });
    expect(wrapper.find('[data-test="add"]').exists()).toBe(false);
  });

  it('renders slot when permission present in hide mode', () => {
    loginAs(['create_user']);
    const wrapper = mount(PermissionGuard, {
      props: { action: 'create_user', mode: 'hide' },
      slots: {
        default: '<button data-test="add">Add</button>',
      },
    });
    expect(wrapper.find('[data-test="add"]').exists()).toBe(true);
  });

  it('renders slot enabled when permission present in disable mode', () => {
    loginAs(['edit_roles']);
    const wrapper = mount(PermissionGuard, {
      props: { action: 'edit_roles', mode: 'disable' },
      slots: { default: BaseButton },
    });
    const btn = wrapper.find('button');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes('disabled')).toBeUndefined();
  });

  it('forces disabled when permission missing in disable mode', () => {
    loginAs(['view_roles']);
    const wrapper = mount(PermissionGuard, {
      props: { action: 'edit_roles', mode: 'disable' },
      slots: { default: BaseButton },
    });
    const btn = wrapper.find('button');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes('disabled')).toBeDefined();
  });
});
