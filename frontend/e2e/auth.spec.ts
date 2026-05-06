import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('lists the three seeded users in the selector', async ({ page }) => {
    await page.goto('/login');
    const selector = page.getByTestId('user-selector').locator('select');
    await expect(selector).toBeVisible();
    const options = await selector
      .locator('option')
      .filter({ hasNotText: 'Select a user' })
      .allTextContents();
    expect(options.join(' ')).toContain('Admin User');
    expect(options.join(' ')).toContain('Editor User');
    expect(options.join(' ')).toContain('Viewer User');
  });

  test('selecting a user and submitting signs in and redirects to the dashboard', async ({
    page,
  }) => {
    await page.goto('/login');
    const selector = page.getByTestId('user-selector').locator('select');
    await selector.selectOption({ label: 'Admin User — Admin' });
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('current-user-name')).toHaveText(
      'Admin User',
    );
  });

  test('logout returns to the login screen', async ({ page }) => {
    await page.goto('/login');
    await page
      .getByTestId('user-selector')
      .locator('select')
      .selectOption({ label: 'Admin User — Admin' });
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('user-selector')).toBeVisible();
  });
});
