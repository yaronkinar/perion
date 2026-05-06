import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Router } from 'vue-router';
import { useLoginPage } from './useLoginPage';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
import type { PublicUserSummary, UserWithPermissions } from '@/types/user.types';

interface Harness {
  result: ReturnType<typeof useLoginPage>;
}

function mountHarness(router: Router): Harness {
  const harness: Harness = { result: null as unknown as Harness['result'] };
  const Component = defineComponent({
    setup() {
      harness.result = useLoginPage({ router });
      return () => h('div');
    },
  });
  mount(Component);
  return harness;
}

function fakeRouter(): Router {
  return { push: vi.fn().mockResolvedValue(undefined) } as unknown as Router;
}

const seededUsers: PublicUserSummary[] = [
  { id: 'u-admin', name: 'Admin User', email: 'admin@test.com', roleName: 'Admin' },
  { id: 'u-editor', name: 'Editor User', email: 'editor@test.com', roleName: 'Editor' },
  { id: 'u-viewer', name: 'Viewer User', email: 'viewer@test.com', roleName: 'Viewer' },
];

describe('useLoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('fetches available users on mount and auto-selects the first one', async () => {
    const auth = useAuthStore();
    auth.fetchAvailableUsers = vi.fn(async () => {
      auth.availableUsers = [...seededUsers];
    });

    const { result } = mountHarness(fakeRouter());

    await nextTick();
    await nextTick();
    await nextTick();

    expect(auth.fetchAvailableUsers).toHaveBeenCalledOnce();
    expect(result.availableUsers.value).toHaveLength(3);
    expect(result.selectedUserId.value).toBe('u-admin');
  });

  it('builds dropdown options as "Name — RoleName"', async () => {
    const auth = useAuthStore();
    auth.availableUsers = [...seededUsers];
    auth.fetchAvailableUsers = vi.fn(async () => undefined);

    const { result } = mountHarness(fakeRouter());

    await nextTick();
    expect(result.userOptions.value).toEqual([
      { label: 'Admin User — Admin', value: 'u-admin' },
      { label: 'Editor User — Editor', value: 'u-editor' },
      { label: 'Viewer User — Viewer', value: 'u-viewer' },
    ]);
  });

  it('selectedUser reflects selectedUserId', async () => {
    const auth = useAuthStore();
    auth.availableUsers = [...seededUsers];
    auth.fetchAvailableUsers = vi.fn(async () => undefined);

    const { result } = mountHarness(fakeRouter());
    await nextTick();
    result.selectedUserId.value = 'u-editor';
    await nextTick();
    expect(result.selectedUser.value?.email).toBe('editor@test.com');
  });

  it('badgeVariant maps role names to color variants', () => {
    const auth = useAuthStore();
    auth.availableUsers = [];
    auth.fetchAvailableUsers = vi.fn(async () => undefined);

    const { result } = mountHarness(fakeRouter());
    expect(result.badgeVariant('Admin')).toBe('admin');
    expect(result.badgeVariant('Editor')).toBe('editor');
    expect(result.badgeVariant('Viewer')).toBe('viewer');
    expect(result.badgeVariant('Other')).toBe('neutral');
  });

  it('handleSubmit logs in, toasts success, and navigates to dashboard', async () => {
    const auth = useAuthStore();
    const toast = useToastStore();
    const fakeUser: UserWithPermissions = {
      id: 'u-admin',
      name: 'Admin User',
      email: 'admin@test.com',
      status: 'active',
      role: { id: 'r', name: 'Admin', permissions: [] },
      permissions: ['view_users'],
    };
    auth.availableUsers = [...seededUsers];
    auth.fetchAvailableUsers = vi.fn(async () => undefined);
    auth.login = vi.fn(async () => {
      auth.setUser(fakeUser);
    });

    const successSpy = vi.spyOn(toast, 'success');
    const router = fakeRouter();
    const { result } = mountHarness(router);

    await nextTick();
    result.selectedUserId.value = 'u-admin';
    await nextTick();

    const event = new Event('submit', { cancelable: true });
    await result.handleSubmit(event);

    expect(event.defaultPrevented).toBe(true);
    expect(auth.login).toHaveBeenCalledWith('u-admin');
    expect(successSpy).toHaveBeenCalledWith('Signed in as Admin User');
    expect(router.push).toHaveBeenCalledWith({ name: 'dashboard' });
    expect(result.submitting.value).toBe(false);
  });

  it('handleSubmit toasts error when login throws and clears submitting', async () => {
    const auth = useAuthStore();
    const toast = useToastStore();
    auth.availableUsers = [...seededUsers];
    auth.fetchAvailableUsers = vi.fn(async () => undefined);
    auth.login = vi.fn(async () => {
      throw new Error('boom');
    });

    const errorSpy = vi.spyOn(toast, 'error');
    const router = fakeRouter();
    const { result } = mountHarness(router);

    await nextTick();
    result.selectedUserId.value = 'u-admin';
    await nextTick();

    await result.handleSubmit(new Event('submit', { cancelable: true }));

    expect(errorSpy).toHaveBeenCalledWith(
      'Could not sign in. Please try again.',
    );
    expect(router.push).not.toHaveBeenCalled();
    expect(result.submitting.value).toBe(false);
  });

  it('handleSubmit is a no-op when no user is selected', async () => {
    const auth = useAuthStore();
    auth.availableUsers = [];
    auth.fetchAvailableUsers = vi.fn(async () => undefined);
    auth.login = vi.fn();

    const { result } = mountHarness(fakeRouter());
    await nextTick();
    result.selectedUserId.value = null;
    await nextTick();

    await result.handleSubmit(new Event('submit', { cancelable: true }));
    expect(auth.login).not.toHaveBeenCalled();
  });

  describe('email/password (JWT) mode', () => {
    it('starts in demo mode and switches to password via setMode', async () => {
      const auth = useAuthStore();
      auth.availableUsers = [...seededUsers];
      auth.fetchAvailableUsers = vi.fn(async () => undefined);

      const { result } = mountHarness(fakeRouter());
      await nextTick();
      expect(result.mode.value).toBe('demo');

      result.setMode('password');
      expect(result.mode.value).toBe('password');
    });

    it('falls back to password mode when demo users are unavailable (e.g. prod)', async () => {
      const auth = useAuthStore();
      auth.fetchAvailableUsers = vi.fn(async () => {
        auth.availableUsers = [];
        auth.error = 'Demo auth disabled';
      });

      const { result } = mountHarness(fakeRouter());
      await nextTick();
      await nextTick();
      await nextTick();

      expect(result.mode.value).toBe('password');
    });

    it('rejects an invalid email and never calls loginWithPassword', async () => {
      const auth = useAuthStore();
      auth.availableUsers = [...seededUsers];
      auth.fetchAvailableUsers = vi.fn(async () => undefined);
      auth.loginWithPassword = vi.fn();

      const { result } = mountHarness(fakeRouter());
      await nextTick();

      result.setMode('password');
      result.passwordEmail.value = 'not-an-email';
      result.passwordPassword.value = 'Password123!';
      await nextTick();

      await result.handlePasswordSubmit();

      expect(auth.loginWithPassword).not.toHaveBeenCalled();
      expect(result.passwordErrors.value.email).toBeTruthy();
    });

    it('rejects a short password and never calls loginWithPassword', async () => {
      const auth = useAuthStore();
      auth.availableUsers = [...seededUsers];
      auth.fetchAvailableUsers = vi.fn(async () => undefined);
      auth.loginWithPassword = vi.fn();

      const { result } = mountHarness(fakeRouter());
      await nextTick();

      result.setMode('password');
      result.passwordEmail.value = 'admin@test.com';
      result.passwordPassword.value = 'short';
      await nextTick();

      await result.handlePasswordSubmit();

      expect(auth.loginWithPassword).not.toHaveBeenCalled();
      expect(result.passwordErrors.value.password).toBeTruthy();
    });

    it('logs in, toasts success, and navigates to dashboard on a valid submit', async () => {
      const auth = useAuthStore();
      const toast = useToastStore();
      const fakeUser: UserWithPermissions = {
        id: 'u-admin',
        name: 'Admin User',
        email: 'admin@test.com',
        status: 'active',
        role: { id: 'r', name: 'Admin', permissions: [] },
        permissions: ['view_users'],
      };
      auth.availableUsers = [...seededUsers];
      auth.fetchAvailableUsers = vi.fn(async () => undefined);
      auth.loginWithPassword = vi.fn(async () => {
        auth.setUser(fakeUser);
        return fakeUser;
      });

      const successSpy = vi.spyOn(toast, 'success');
      const router = fakeRouter();
      const { result } = mountHarness(router);

      await nextTick();
      result.setMode('password');
      result.passwordEmail.value = 'admin@test.com';
      result.passwordPassword.value = 'Password123!';
      await nextTick();

      await result.handlePasswordSubmit();

      expect(auth.loginWithPassword).toHaveBeenCalledWith(
        'admin@test.com',
        'Password123!',
      );
      expect(successSpy).toHaveBeenCalledWith('Signed in as Admin User');
      expect(router.push).toHaveBeenCalledWith({ name: 'dashboard' });
      expect(result.passwordSubmitting.value).toBe(false);
      expect(result.passwordError.value).toBeNull();
    });

    it('surfaces a server error when loginWithPassword throws', async () => {
      const auth = useAuthStore();
      const toast = useToastStore();
      auth.availableUsers = [...seededUsers];
      auth.fetchAvailableUsers = vi.fn(async () => undefined);
      auth.loginWithPassword = vi.fn(async () => {
        throw new Error('Invalid credentials');
      });

      const errorSpy = vi.spyOn(toast, 'error');
      const router = fakeRouter();
      const { result } = mountHarness(router);

      await nextTick();
      result.setMode('password');
      result.passwordEmail.value = 'admin@test.com';
      result.passwordPassword.value = 'WrongPassword1';
      await nextTick();

      await result.handlePasswordSubmit();

      expect(errorSpy).toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();
      expect(result.passwordError.value).toBeTruthy();
      expect(result.passwordSubmitting.value).toBe(false);
    });
  });
});
