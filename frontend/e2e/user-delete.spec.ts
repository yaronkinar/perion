import { expect, type Locator, type Page, test } from '@playwright/test';
import { SUCCESS_MESSAGES } from '../src/constants/messages';
import { SEEDED_PASSWORD, openPasswordLogin, submitPasswordLogin } from './helpers';

async function loginAsAdmin(page: Page): Promise<void> {
  await openPasswordLogin(page);
  await submitPasswordLogin(page, 'admin@test.com', SEEDED_PASSWORD);
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
    const roleOption = Array.from(select.options).find(
      (option) => !option.disabled && option.value !== '',
    );
    return roleOption?.value ?? '';
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

function rowForUser(page: Page, email: string): Locator {
  return page.locator('tbody tr', { hasText: email });
}

async function openDeleteModalForUser(page: Page, email: string): Promise<void> {
  await rowForUser(page, email).getByTestId('delete-user').click();
  await expect(page.getByTestId('delete-user-modal-message')).toBeVisible();
}

async function confirmDelete(page: Page): Promise<void> {
  await page.getByTestId('delete-user-confirm').click();
}

test.describe('Delete user modal', () => {
  test('cancel keeps the user and closes the modal', async ({ page }) => {
    await loginAsAdmin(page);

    const userKey = Date.now();
    const name = `Delete Cancel ${userKey}`;
    const email = `delete-cancel-${userKey}@test.com`;
    await createUser(page, name, email);

    await openDeleteModalForUser(page, email);
    await expect(page.getByTestId('delete-user-modal-message')).toContainText(name);
    await page.getByTestId('delete-user-cancel').click();

    await expect(page.getByTestId('delete-user-modal-message')).toHaveCount(0);
    await expect(rowForUser(page, email)).toBeVisible();

    // Cleanup the temporary user to keep the suite repeatable.
    await openDeleteModalForUser(page, email);
    await confirmDelete(page);
    await expect(rowForUser(page, email)).toHaveCount(0);
  });

  test('confirm removes the user and shows success toast', async ({ page }) => {
    await loginAsAdmin(page);

    const userKey = Date.now();
    const name = `Delete Confirm ${userKey}`;
    const email = `delete-confirm-${userKey}@test.com`;
    await createUser(page, name, email);

    await openDeleteModalForUser(page, email);
    await expect(page.getByTestId('delete-user-modal-message')).toContainText(name);
    await confirmDelete(page);

    await expect(
      page
        .getByTestId('toast-success')
        .filter({ hasText: SUCCESS_MESSAGES.userDeleted }),
    ).toBeVisible();
    await expect(rowForUser(page, email)).toHaveCount(0);
  });
});
