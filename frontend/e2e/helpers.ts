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

export async function selectFirstAvailableRole(
  page: Page,
  timeoutMs = 10_000,
): Promise<string> {
  const roleSelect = page.getByLabel(/^Role/);
  await expect(roleSelect).toBeVisible({ timeout: timeoutMs });

  const started = Date.now();
  let roleValue = '';
  while (!roleValue && Date.now() - started < timeoutMs) {
    roleValue = await roleSelect.evaluate((node) => {
      const select = node as HTMLSelectElement;
      const firstRole = Array.from(select.options).find(
        (option) => !option.disabled && option.value !== '',
      );
      return firstRole?.value ?? '';
    });
    if (!roleValue) {
      await page.waitForTimeout(200);
    }
  }

  expect(roleValue).not.toBe('');
  await roleSelect.selectOption(roleValue);
  return roleValue;
}
