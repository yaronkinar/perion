import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../src/auth/dto/login.dto';

describe('LoginDto (password + email validation)', () => {
  it('accepts a valid email and password with at least 8 characters', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'admin@test.com',
      password: 'Password123!',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'admin@test.com',
      password: 'short',
    });
    const errors = await validate(dto);
    const passwordErrors = errors.find((e) => e.property === 'password');
    expect(passwordErrors?.constraints).toEqual(
      expect.objectContaining({
        minLength: expect.any(String),
      }),
    );
  });

  it('rejects an empty password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'admin@test.com',
      password: '',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('accepts exactly 8 characters for password (boundary)', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'admin@test.com',
      password: '12345678',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('normalizes email with trim and lower case before validation', async () => {
    const dto = plainToInstance(LoginDto, {
      email: '  Admin@Test.com  ',
      password: 'Password123!',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('admin@test.com');
  });

  it('rejects invalid email even when password is valid', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'not-an-email',
      password: 'Password123!',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});
