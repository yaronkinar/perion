import { expect, type Locator, type Page, test } from '@playwright/test';
import { SUCCESS_MESSAGES } from '../src/constants/messages';

function rowForUser(page: Page, email: string): Locator {
  return page.locator('tbody tr', { hasText: email });
}

async function loginAs(page: Page, label: string): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('user-selector').locator('select').selectOption({ label });
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function createUserAsAdmin(
  page: Page,
  name: string,
  email: string,
  roleLabel: string,
): Promise<void> {
  await page.getByTestId('add-user-button').click();
  await expect(page.getByTestId('add-user-form')).toBeVisible();

  await page.getByTestId('add-user-name').locator('input').fill(name);
  await page.getByTestId('add-user-email').locator('input').fill(email);
  await page.getByLabel(/^Role/).selectOption({ label: roleLabel });
  await page.getByRole('button', { name: 'Create user' }).click();

  await expect(
    page.getByTestId('toast-success').filter({ hasText: SUCCESS_MESSAGES.userCreated }),
  ).toBeVisible();
  await expect(rowForUser(page, email)).toBeVisible();
}

async function deleteUserAsAdmin(page: Page, email: string): Promise<void> {
  const row = rowForUser(page, email);
  await row.getByTestId('delete-user').click();
  await expect(page.getByTestId('delete-user-modal-message')).toBeVisible();
  await page.getByTestId('delete-user-confirm').click();
  await expect(rowForUser(page, email)).toHaveCount(0);
}

test.describe('Editor change-role action', () => {
  test('editor can change another user role and save', async ({ page }) => {
    const key = Date.now();
    const email = `editor-role-target-${key}@test.com`;
    const name = `Editor Role Target ${key}`;

    await loginAs(page, 'Admin User — Admin');
    await createUserAsAdmin(page, name, email, 'Viewer');
    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/login$/);

    await loginAs(page, 'Editor User — Editor');
    const row = rowForUser(page, email);
    await expect(row).toContainText('Viewer');

    await row.getByTestId('edit-user').click();
    const editForm = page.getByTestId('edit-user-form');
    await expect(editForm).toBeVisible();

    const roleSelect = editForm.getByLabel(/^Role/);
    await expect(roleSelect).toBeEnabled();
    await roleSelect.selectOption({ label: 'Admin' });
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(
      page.getByTestId('toast-success').filter({ hasText: SUCCESS_MESSAGES.userUpdated }),
    ).toBeVisible();
    await expect(rowForUser(page, email)).toContainText('Admin');

    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/login$/);

    await loginAs(page, 'Admin User — Admin');
    await deleteUserAsAdmin(page, email);
  });

  test('viewer cannot edit users or change roles', async ({ page }) => {
    await loginAs(page, 'Viewer User — Viewer');
    await expect(page.locator('[data-test="edit-user"]')).toHaveCount(0);
    await expect(page.getByTestId('section-roles')).toHaveCount(0);
  });
});
