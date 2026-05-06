import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useAddUserModal } from './useAddUserModal';
import type { Role } from '@/types/role.types';
import type { CreateUserDto } from '@/types/user.types';

const ROLE_ID = '11111111-1111-4111-8111-111111111111';

const roles: Role[] = [
  { id: ROLE_ID, name: 'Admin', permissions: [] },
];

interface Harness {
  result: ReturnType<typeof useAddUserModal>;
  emit: ReturnType<typeof vi.fn>;
  props: { open: boolean; roles: Role[]; serverErrors?: Record<string, string> };
}

function mountHarness(): Harness {
  const harness = {} as Harness;
  const props = reactive<Harness['props']>({
    open: true,
    roles,
    serverErrors: {},
  });
  const emit = vi.fn();
  harness.emit = emit;
  harness.props = props;

  const Component = defineComponent({
    setup() {
      harness.result = useAddUserModal(
        props,
        emit as unknown as Parameters<typeof useAddUserModal>[1],
      );
      return () => h('div');
    },
  });
  mount(Component);
  return harness;
}

describe('useAddUserModal (VeeValidate + Zod)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('does not emit submit when the form is invalid and surfaces field errors', async () => {
    const h = mountHarness();
    await nextTick();

    await h.result.handleSubmit();
    await nextTick();

    expect(h.emit).not.toHaveBeenCalled();
    expect(h.result.errors.value.name).toBe('Name is required');
    expect(h.result.errors.value.email).toBe('Email is required');
    expect(h.result.errors.value.roleId).toBe('Role is required');
  });

  it('flags an invalid email format', async () => {
    const h = mountHarness();
    await nextTick();
    h.result.name.value = 'Ada';
    h.result.email.value = 'broken';
    h.result.roleId.value = ROLE_ID;
    await nextTick();

    await h.result.handleSubmit();
    await nextTick();

    expect(h.emit).not.toHaveBeenCalled();
    expect(h.result.errors.value.email).toBe('Email is invalid');
  });

  it('emits a validated CreateUserDto when the form is valid', async () => {
    const h = mountHarness();
    await nextTick();
    h.result.name.value = '  Ada  ';
    h.result.email.value = '  ada@test.com  ';
    h.result.roleId.value = ROLE_ID;
    await nextTick();

    await h.result.handleSubmit();
    await nextTick();

    expect(h.emit).toHaveBeenCalledTimes(1);
    const [event, dto] = h.emit.mock.calls[0];
    expect(event).toBe('submit');
    const submitted = dto as CreateUserDto;
    expect(submitted.name).toBe('Ada');
    expect(submitted.email).toBe('ada@test.com');
    expect(submitted.status).toBe('active');
    expect(submitted.roleId).toBe(ROLE_ID);
  });

  it('maps incoming serverErrors prop onto the matching fields', async () => {
    const h = mountHarness();
    await nextTick();

    h.props.serverErrors = { email: 'Email already in use' };
    await nextTick();
    await nextTick();

    expect(h.result.errors.value.email).toBe('Email already in use');
  });

  it('resets the form whenever the modal re-opens', async () => {
    const h = mountHarness();
    await nextTick();
    h.result.name.value = 'Stale';
    h.result.email.value = 'stale@test.com';
    await nextTick();

    h.props.open = false;
    await nextTick();
    h.props.open = true;
    await nextTick();
    await nextTick();

    expect(h.result.name.value).toBe('');
    expect(h.result.email.value).toBe('');
    expect(h.result.roleId.value).toBe('');
  });
});

