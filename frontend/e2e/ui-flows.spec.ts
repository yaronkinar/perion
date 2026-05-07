import { expect, type Locator, type Page, test } from '@playwright/test';
import { SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '../src/constants/messages';
import { openPasswordLogin } from './helpers';

function rowForUser(page: Page, email: string): Locator {
  return page.locator('tbody tr', { hasText: email });
}

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page
    .getByTestId('user-selector')
    .locator('select')
    .selectOption({ label: 'Admin User — Admin' });
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function createUser(page: Page, name: string, email: string): Promise<void> {
  await page.getByTestId('add-user-button').click();
  await expect(page.getByTestId('add-user-form')).toBeVisible();

  await page.getByTestId('add-user-name').locator('input').fill(name);
  await page.getByTestId('add-user-email').locator('input').fill(email);

  const roleSelect = page.getByLabel(/^Role/);
  const roleValue = await roleSelect.evaluate((node) => {
    const select = node as HTMLSelectElement;
    const firstRole = Array.from(select.options).find(
      (option) => !option.disabled && option.value !== '',
    );
    return firstRole?.value ?? '';
  });
  expect(roleValue).not.toBe('');
  await roleSelect.selectOption(roleValue);

  await page.getByRole('button', { name: 'Create user' }).click();
  await expect(
    page
      .getByTestId('toast-success')
      .filter({ hasText: SUCCESS_MESSAGES.userCreated })
      .first(),
  ).toBeVisible({ timeout: 15_000 });
  await expect(rowForUser(page, email)).toBeVisible();
}

test.describe('UI flows', () => {
  test('password visibility toggle switches the password input type', async ({
    page,
  }) => {
    await openPasswordLogin(page);
    const passwordInput = page.getByTestId('login-password-input').locator('input');
    const toggle = page.getByTestId('login-password-visibility');

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggle.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await toggle.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('password login email validates on blur', async ({ page }) => {
    await openPasswordLogin(page);
    const emailInput = page.getByTestId('login-email-input').locator('input');
    const passwordInput = page.getByTestId('login-password-input').locator('input');

    await emailInput.fill('not-an-email');
    await passwordInput.click();
    await expect(page.getByText(VALIDATION_MESSAGES.emailInvalid)).toBeVisible();
  });

  test('password login password validates on blur', async ({ page }) => {
    await openPasswordLogin(page);
    const emailInput = page.getByTestId('login-email-input').locator('input');
    const passwordInput = page.getByTestId('login-password-input').locator('input');

    await passwordInput.fill('short');
    await emailInput.click();
    await expect(
      page.getByText(VALIDATION_MESSAGES.passwordTooShort),
    ).toBeVisible();
  });

  test('add user modal closes when clicking the backdrop', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('add-user-button').click();
    await expect(page.getByTestId('add-user-form')).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.getByTestId('add-user-form')).toHaveCount(0);
  });

  test('editing a user updates table values and shows success toast', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const userKey = Date.now();
    const originalName = `Edit Target ${userKey}`;
    const updatedName = `Edited Name ${userKey}`;
    const email = `edit-target-${userKey}@test.com`;
    await createUser(page, originalName, email);

    const userRow = rowForUser(page, email);
    await userRow.getByTestId('edit-user').click();
    await expect(page.getByTestId('edit-user-form')).toBeVisible();

    await page.getByLabel(/^Name/).fill(updatedName);
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(
      page
        .getByTestId('toast-success')
        .filter({ hasText: SUCCESS_MESSAGES.userUpdated }),
    ).toBeVisible();
    await expect(userRow).toContainText(updatedName);

    // Cleanup to keep repeated runs stable.
    await userRow.getByTestId('delete-user').click();
    await page.getByTestId('delete-user-confirm').click();
    await expect(rowForUser(page, email)).toHaveCount(0);
  });

  test('add user form validates invalid email before submit', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('add-user-button').click();
    await expect(page.getByTestId('add-user-form')).toBeVisible();

    await page.getByTestId('add-user-name').locator('input').fill('Validation User');
    await page.getByTestId('add-user-email').locator('input').fill('not-an-email');
    const roleSelect = page.getByLabel(/^Role/);
    const roleValue = await roleSelect.evaluate((node) => {
      const select = node as HTMLSelectElement;
      const firstRole = Array.from(select.options).find(
        (option) => !option.disabled && option.value !== '',
      );
      return firstRole?.value ?? '';
    });
    expect(roleValue).not.toBe('');
    await roleSelect.selectOption(roleValue);
    await page.getByRole('button', { name: 'Create user' }).click();
    await expect(page.getByText(VALIDATION_MESSAGES.emailInvalid)).toBeVisible();
  });

  test('add user form validates email on blur', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('add-user-button').click();
    await expect(page.getByTestId('add-user-form')).toBeVisible();

    const nameInput = page.getByTestId('add-user-name').locator('input');
    const emailInput = page.getByTestId('add-user-email').locator('input');
    await emailInput.fill('not-an-email');
    await nameInput.click();
    await expect(page.getByText(VALIDATION_MESSAGES.emailInvalid)).toBeVisible();
  });

  test('edit user form validates invalid email before submit', async ({ page }) => {
    await loginAsAdmin(page);

    const firstRow = page.locator('tbody tr').first();
    await firstRow.getByTestId('edit-user').click();
    await expect(page.getByTestId('edit-user-form')).toBeVisible();

    await page.getByLabel(/^Email/).fill('not-an-email');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText(VALIDATION_MESSAGES.emailInvalid)).toBeVisible();
  });

  test('edit user form validates email on blur', async ({ page }) => {
    await loginAsAdmin(page);

    const firstRow = page.locator('tbody tr').first();
    await firstRow.getByTestId('edit-user').click();
    await expect(page.getByTestId('edit-user-form')).toBeVisible();

    const nameInput = page.getByLabel(/^Name/);
    const emailInput = page.getByLabel(/^Email/);
    await emailInput.fill('not-an-email');
    await nameInput.click();
    await expect(page.getByText(VALIDATION_MESSAGES.emailInvalid)).toBeVisible();
  });

  test('admin can update a role permission and revert it', async ({ page }) => {
    await loginAsAdmin(page);

    const viewerRoleCard = page.locator('article', { hasText: 'Viewer' }).first();
    await viewerRoleCard.getByTestId('edit-role').click();
    await expect(page.getByTestId('edit-role-form')).toBeVisible();

    const deleteUserPermission = page
      .getByTestId('edit-role-form')
      .getByLabel('Delete user', { exact: true });
    const initialState = await deleteUserPermission.isChecked();
    await deleteUserPermission.click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page
        .getByTestId('toast-success')
        .filter({ hasText: SUCCESS_MESSAGES.roleUpdated }),
    ).toBeVisible();
    await expect(page.getByTestId('edit-role-form')).toHaveCount(0);

    await page.locator('article', { hasText: 'Viewer' }).first().getByTestId('edit-role').click();
    const reopenedPermission = page
      .getByTestId('edit-role-form')
      .getByLabel('Delete user', { exact: true });
    await expect(reopenedPermission).toBeChecked({ checked: !initialState });

    // Restore initial permission state so repeated runs remain deterministic.
    await reopenedPermission.click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByTestId('edit-role-form')).toHaveCount(0);
  });
});
