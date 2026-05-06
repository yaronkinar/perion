import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from './auth.store';
import type { UserWithPermissions } from '@/types/user.types';

const hoisted = vi.hoisted(() => ({
  loginWithPassword: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    listUsers: vi.fn(),
    selectUser: vi.fn(),
    loginWithPassword: hoisted.loginWithPassword,
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

const fakeUser: UserWithPermissions = {
  id: 'u-admin',
  name: 'Admin User',
  email: 'admin@test.com',
  status: 'active',
  role: { id: 'r', name: 'Admin', permissions: [] },
  permissions: ['view_users'],
};

describe('useAuthStore (password login)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    hoisted.loginWithPassword.mockReset();
  });

  it('delegates to authService.loginWithPassword with email and password', async () => {
    hoisted.loginWithPassword.mockResolvedValue({
      token: 'jwt-token',
      user: fakeUser,
    });
    const store = useAuthStore();

    await store.loginWithPassword('admin@test.com', 'Password123!');

    expect(hoisted.loginWithPassword).toHaveBeenCalledWith(
      'admin@test.com',
      'Password123!',
    );
  });

  it('stores the returned user, sets initialized, and returns the user', async () => {
    hoisted.loginWithPassword.mockResolvedValue({
      token: 'jwt-token',
      user: fakeUser,
    });
    const store = useAuthStore();
    store.initialized = false;

    const returned = await store.loginWithPassword(
      'admin@test.com',
      'Password123!',
    );

    expect(returned).toEqual(fakeUser);
    expect(store.currentUser).toEqual(fakeUser);
    expect(store.initialized).toBe(true);
    expect(store.loading).toBe(false);
  });

  it('clears loading in finally when loginWithPassword rejects', async () => {
    hoisted.loginWithPassword.mockRejectedValue(new Error('Invalid credentials'));
    const store = useAuthStore();

    await expect(
      store.loginWithPassword('nobody@test.com', 'Password123!'),
    ).rejects.toThrow('Invalid credentials');

    expect(store.loading).toBe(false);
    expect(store.currentUser).toBeNull();
  });

  it('clears store error at the start of password login (even when the call fails)', async () => {
    hoisted.loginWithPassword.mockRejectedValue(new Error('Invalid credentials'));
    const store = useAuthStore();
    store.error = 'previous error';

    await expect(
      store.loginWithPassword('nobody@test.com', 'wrong'),
    ).rejects.toThrow();

    expect(store.error).toBeNull();
  });
});
