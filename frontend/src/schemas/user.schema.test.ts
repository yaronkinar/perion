import { describe, expect, it } from 'vitest';
import { createUserSchema, updateUserSchema } from './user.schema';
import { VALIDATION_MESSAGES } from '@/constants/messages';

const validRoleId = '11111111-1111-4111-8111-111111111111';

describe('createUserSchema', () => {
  it('accepts a fully valid payload', () => {
    const result = createUserSchema.safeParse({
      name: 'New User',
      email: 'new@test.com',
      status: 'active',
      roleId: validRoleId,
    });
    expect(result.success).toBe(true);
  });

  it('flags blank name + invalid email + missing roleId', () => {
    const result = createUserSchema.safeParse({
      name: '   ',
      email: 'not-an-email',
      status: 'active',
      roleId: null,
    });
    expect(result.success).toBe(false);
    if (result.success) return;

    const messagesByPath = new Map(
      result.error.issues.map((i) => [i.path.join('.'), i.message]),
    );
    expect(messagesByPath.get('name')).toBe(VALIDATION_MESSAGES.nameRequired);
    expect(messagesByPath.get('email')).toBe(VALIDATION_MESSAGES.emailInvalid);
    expect(messagesByPath.get('roleId')).toBe(VALIDATION_MESSAGES.roleRequired);
  });

  it('rejects a non-uuid roleId with the role-required message', () => {
    const result = createUserSchema.safeParse({
      name: 'Ok',
      email: 'ok@test.com',
      status: 'active',
      roleId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const issue = result.error.issues.find((i) => i.path[0] === 'roleId');
    expect(issue?.message).toBe(VALIDATION_MESSAGES.roleRequired);
  });

  it('trims surrounding whitespace from name and email before validating', () => {
    const result = createUserSchema.safeParse({
      name: '  Ada  ',
      email: '  ada@test.com  ',
      status: 'active',
      roleId: validRoleId,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe('Ada');
    expect(result.data.email).toBe('ada@test.com');
  });
});

describe('updateUserSchema', () => {
  it('requires roleId to be present, even when null for editors', () => {
    const result = updateUserSchema.safeParse({
      name: 'Edited',
      email: 'edited@test.com',
      status: 'active',
    });
    expect(result.success).toBe(false);
  });

  it('allows roleId to be null (initial form state)', () => {
    const result = updateUserSchema.safeParse({
      name: 'Edited',
      email: 'edited@test.com',
      status: 'active',
      roleId: null,
    });
    expect(result.success).toBe(true);
  });

  it('still rejects invalid email and blank name', () => {
    const result = updateUserSchema.safeParse({
      name: '',
      email: 'broken',
      status: 'inactive',
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.issues.map((i) => i.path.join('.'));
    expect(fields).toEqual(expect.arrayContaining(['name', 'email']));
  });
});
