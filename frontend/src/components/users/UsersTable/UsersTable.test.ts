import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import UsersTable from './UsersTable.vue';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/role.types';
import type { PermissionAction } from '@/types/permission.types';
import type { User, UserWithPermissions } from '@/types/user.types';

const adminRole: Role = {
  id: 'r-admin',
  name: 'Admin',
  permissions: [],
};
const viewerRole: Role = {
  id: 'r-viewer',
  name: 'Viewer',
  permissions: [],
};

const seedUsers: User[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'a@test.com',
    status: 'active',
    role: adminRole,
  },
  {
    id: '2',
    name: 'Viewer',
    email: 'v@test.com',
    status: 'active',
    role: viewerRole,
  },
];
function loginAs(permissions: PermissionAction[]): void {
  const stub: UserWithPermissions = {
    id: 'sb',
    name: 'Tester',
    email: 't@test.com',
    status: 'active',
    role: { id: 'r', name: 'Admin', permissions: [] },
    permissions,
  };
  useAuthStore().setUser(stub);
}

describe('UsersTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('Admin sees role column and edit + delete actions', () => {
    loginAs([
      'view_users',
      'create_user',
      'edit_user',
      'delete_user',
      'view_roles',
      'edit_roles',
      'change_role',
    ]);
    const wrapper = mount(UsersTable, { props: { users: seedUsers } });
    expect(wrapper.text()).toContain('Role');
    expect(wrapper.find('[data-test="edit-user"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="delete-user"]').exists()).toBe(true);
  });

  it('Editor sees edit but not delete buttons', () => {
    loginAs(['view_users', 'edit_user', 'view_roles', 'change_role']);
    const wrapper = mount(UsersTable, { props: { users: seedUsers } });
    expect(wrapper.find('[data-test="edit-user"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="delete-user"]').exists()).toBe(false);
  });

  it('Viewer sees no role column and no actions', () => {
    loginAs(['view_users']);
    const wrapper = mount(UsersTable, {
      props: {
        users: seedUsers.map(({ role: _role, ...rest }) => rest as User),
      },
    });
    expect(wrapper.text()).not.toContain('Role');
    expect(wrapper.find('[data-test="edit-user"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="delete-user"]').exists()).toBe(false);
  });
});
