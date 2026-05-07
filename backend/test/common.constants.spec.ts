import {
  authLoginThrottleLimit,
  authLoginThrottleTtlSeconds,
} from '../src/common/constants';

describe('common/constants env readers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AUTH_LOGIN_THROTTLE_LIMIT;
    delete process.env.AUTH_LOGIN_THROTTLE_TTL_SECONDS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses throttle defaults for invalid values', () => {
    process.env.AUTH_LOGIN_THROTTLE_LIMIT = '0';
    process.env.AUTH_LOGIN_THROTTLE_TTL_SECONDS = '-1';
    expect(authLoginThrottleLimit()).toBe(5);
    expect(authLoginThrottleTtlSeconds()).toBe(60);
  });

  it('reads throttle values from env', () => {
    process.env.AUTH_LOGIN_THROTTLE_LIMIT = '7';
    process.env.AUTH_LOGIN_THROTTLE_TTL_SECONDS = '90';
    expect(authLoginThrottleLimit()).toBe(7);
    expect(authLoginThrottleTtlSeconds()).toBe(90);
  });
});
