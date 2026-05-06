import { expect, type Page } from '@playwright/test';

/** Matches seeded users in README / backend seed. */
export const SEEDED_PASSWORD = 'Password123!';

export async function openPasswordLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('login-tab-password').click();
  await expect(page.getByTestId('login-password-form')).toBeVisible();
}

export async function submitPasswordLogin(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.getByTestId('login-email-input').locator('input').fill(email);
  await page.getByTestId('login-password-input').locator('input').fill(password);
  await page.getByTestId('login-password-submit').click();
}
