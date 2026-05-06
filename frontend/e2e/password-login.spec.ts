import { expect, test } from '@playwright/test';
import { VALIDATION_MESSAGES } from '../src/constants/messages';
import { openPasswordLogin, SEEDED_PASSWORD, submitPasswordLogin } from './helpers';

/** Backend `MESSAGES.INVALID_CREDENTIALS` as returned by the HTTP exception filter. */
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

test.describe('Password login', () => {
  test('Email & password tab shows the form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-tab-password')).toBeVisible();
    await page.getByTestId('login-tab-password').click();
    await expect(page.getByTestId('login-password-form')).toBeVisible();
    await expect(
      page.getByTestId('login-email-input').locator('input'),
    ).toBeVisible();
    await expect(
      page.getByTestId('login-password-input').locator('input'),
    ).toBeVisible();
  });

  test('signs in with seeded admin credentials and lands on the dashboard', async ({
    page,
  }) => {
    await openPasswordLogin(page);
    await submitPasswordLogin(page, 'admin@test.com', SEEDED_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('current-user-name')).toHaveText(
      'Admin User',
    );
  });

  test('signs in as viewer via password and shows the limited dashboard', async ({
    page,
  }) => {
    await openPasswordLogin(page);
    await submitPasswordLogin(page, 'viewer@test.com', SEEDED_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('current-user-name')).toHaveText(
      'Viewer User',
    );
    await expect(page.getByTestId('section-roles')).toHaveCount(0);
  });

  test('shows an error for wrong password without leaving the login page', async ({
    page,
  }) => {
    await openPasswordLogin(page);
    await submitPasswordLogin(page, 'admin@test.com', 'WrongPassword1');
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: INVALID_CREDENTIALS_MESSAGE }),
    ).toBeVisible();
  });

  test('blocks submit when password is shorter than 8 characters (client validation)', async ({
    page,
  }) => {
    await openPasswordLogin(page);
    await page.getByTestId('login-email-input').locator('input').fill('admin@test.com');
    await page.getByTestId('login-password-input').locator('input').fill('short');
    await page.getByTestId('login-password-submit').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByText(VALIDATION_MESSAGES.passwordTooShort),
    ).toBeVisible();
  });

  test('blocks submit when email is not valid (client validation)', async ({
    page,
  }) => {
    await openPasswordLogin(page);
    await page.getByTestId('login-email-input').locator('input').fill('not-an-email');
    await page.getByTestId('login-password-input').locator('input').fill(SEEDED_PASSWORD);
    await page.getByTestId('login-password-submit').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByText(VALIDATION_MESSAGES.emailInvalid),
    ).toBeVisible();
  });
});

test.describe('Route guard', () => {
  test('redirects unauthenticated visitors from /dashboard to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });
});
