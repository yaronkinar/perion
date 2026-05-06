import { describe, expect, it } from 'vitest';
import { loginSchema } from './login.schema';
import { VALIDATION_MESSAGES } from '@/constants/messages';

describe('loginSchema', () => {
  it('accepts a valid email + password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@test.com',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
  });

  it('trims the email before validating', () => {
    const result = loginSchema.safeParse({
      email: '  admin@test.com  ',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('admin@test.com');
    }
  });

  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'Password123!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain(
        VALIDATION_MESSAGES.emailRequired,
      );
    }
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain(
        VALIDATION_MESSAGES.emailInvalid,
      );
    }
  });

  it('rejects a short password (matches backend min length of 8)', () => {
    const result = loginSchema.safeParse({
      email: 'admin@test.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain(
        VALIDATION_MESSAGES.passwordTooShort,
      );
    }
  });
});
