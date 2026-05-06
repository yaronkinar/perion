import { expect, Page, test } from '@playwright/test';

const LABELS = {
  'admin@test.com': 'Admin User — Admin',
  'editor@test.com': 'Editor User — Editor',
  'viewer@test.com': 'Viewer User — Viewer',
} as const;

async function loginAs(
  page: Page,
  email: keyof typeof LABELS,
): Promise<void> {
  await page.goto('/login');
  await page
    .getByTestId('user-selector')
    .locator('select')
    .selectOption({ label: LABELS[email] });
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe('Permission visibility', () => {
  test('Admin sees Add User and the Edit Role button is enabled', async ({
    page,
  }) => {
    await loginAs(page, 'admin@test.com');
    await expect(page.getByTestId('add-user-button')).toBeVisible();
    await expect(page.getByTestId('section-roles')).toBeVisible();
    const editRole = page
      .getByTestId('section-roles')
      .locator('[data-test="edit-role"]')
      .first();
    await expect(editRole).toBeVisible();
    await expect(editRole).toBeEnabled();
  });

  test('Editor: Add User hidden, Edit Role visible but disabled, Delete hidden', async ({
    page,
  }) => {
    await loginAs(page, 'editor@test.com');
    await expect(page.getByTestId('add-user-button')).toHaveCount(0);
    await expect(
      page.locator('[data-test="delete-user"]'),
    ).toHaveCount(0);

    const editRole = page
      .getByTestId('section-roles')
      .locator('[data-test="edit-role"]')
      .first();
    await expect(editRole).toBeVisible();
    await expect(editRole).toBeDisabled();
  });

  test('Viewer: roles section hidden, no actions, no Role column', async ({
    page,
  }) => {
    await loginAs(page, 'viewer@test.com');
    await expect(page.getByTestId('section-roles')).toHaveCount(0);
    await expect(page.getByTestId('add-user-button')).toHaveCount(0);
    await expect(page.locator('[data-test="edit-user"]')).toHaveCount(0);
    await expect(page.locator('[data-test="delete-user"]')).toHaveCount(0);

    const usersSection = page.getByTestId('section-users');
    await expect(usersSection).toBeVisible();
    await expect(usersSection.locator('thead')).not.toContainText('Role');
  });
});
