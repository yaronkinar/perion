/**
 * Demo recording spec — produces a single .webm video walking through
 * the major flows of the Perion RBAC app.
 *
 * Run with:
 *   npm run demo:video
 *
 * Output: frontend/demo-output/<test-folder>/video.webm
 *
 * Assumes the docker-compose stack is running with the dev (pick-a-user)
 * backend or the prod-style backend — this spec only uses the password
 * login which is available in both modes.
 */
import { expect, type Locator, type Page, test } from '@playwright/test';
import { SUCCESS_MESSAGES } from '../src/constants/messages';

const SEEDED_PASSWORD = 'Password123!';

const ACCOUNTS = {
  admin: { email: 'admin@test.com', name: 'Admin User' },
  editor: { email: 'editor@test.com', name: 'Editor User' },
  viewer: { email: 'viewer@test.com', name: 'Viewer User' },
} as const;

type AccountKey = keyof typeof ACCOUNTS;

/** Narrative pause so each step is readable in the recorded video. */
async function beat(page: Page, ms = 700): Promise<void> {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(ms);
}

async function typeInto(locator: Locator, value: string): Promise<void> {
  await locator.click();
  await locator.fill('');
  await locator.pressSequentially(value, { delay: 35 });
}

async function loginAs(page: Page, key: AccountKey): Promise<void> {
  const account = ACCOUNTS[key];
  await page.goto('/login');
  await beat(page, 600);

  await page.getByTestId('login-tab-password').click();
  await expect(page.getByTestId('login-password-form')).toBeVisible();
  await beat(page, 400);

  await typeInto(page.getByTestId('login-email-input').locator('input'), account.email);
  await typeInto(page.getByTestId('login-password-input').locator('input'), SEEDED_PASSWORD);
  await beat(page, 400);

  await page.getByTestId('login-password-submit').click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('current-user-name')).toHaveText(account.name);
  await beat(page, 800);
}

async function logout(page: Page): Promise<void> {
  await beat(page, 600);
  await page.getByTestId('logout-button').click();
  await expect(page).toHaveURL(/\/login$/);
  await beat(page, 600);
}

function rowFor(page: Page, email: string): Locator {
  return page.locator('tbody tr', { hasText: email });
}

async function pickFirstSelectableRole(page: Page, labelRegex: RegExp): Promise<void> {
  const roleSelect = page.getByLabel(labelRegex);
  const value = await roleSelect.evaluate((node) => {
    const select = node as HTMLSelectElement;
    const opt = Array.from(select.options).find(
      (o) => !o.disabled && o.value !== '',
    );
    return opt?.value ?? '';
  });
  expect(value).not.toBe('');
  await roleSelect.selectOption(value);
}

test.describe('Perion RBAC — guided demo', () => {
  test('full app walkthrough', async ({ page }) => {
    test.setTimeout(4 * 60 * 1000);

    /* --- Act 1: Admin signs in and tours the dashboard --- */
    await loginAs(page, 'admin');

    await expect(page.getByTestId('section-users')).toBeVisible();
    await expect(page.getByTestId('section-roles')).toBeVisible();
    await page.getByTestId('section-roles').scrollIntoViewIfNeeded();
    await beat(page, 1000);
    await page.getByTestId('section-users').scrollIntoViewIfNeeded();
    await beat(page, 800);

    /* --- Act 2: Admin creates a new user --- */
    const stamp = Date.now();
    const newName = `Demo User ${stamp}`;
    const newEmail = `demo-user-${stamp}@test.com`;

    await page.getByTestId('add-user-button').click();
    await expect(page.getByTestId('add-user-form')).toBeVisible();
    await beat(page, 400);

    await typeInto(page.getByTestId('add-user-name').locator('input'), newName);
    await typeInto(page.getByTestId('add-user-email').locator('input'), newEmail);
    await pickFirstSelectableRole(page, /^Role/);
    await beat(page, 400);

    await page.getByRole('button', { name: 'Create user' }).click();
    await expect(
      page.getByTestId('toast-success').filter({ hasText: SUCCESS_MESSAGES.userCreated }),
    ).toBeVisible();
    await expect(rowFor(page, newEmail)).toBeVisible();
    await beat(page, 800);

    /* --- Act 3: Admin edits the new user --- */
    const updatedName = `${newName} (edited)`;
    await rowFor(page, newEmail).getByTestId('edit-user').click();
    await expect(page.getByTestId('edit-user-form')).toBeVisible();
    await beat(page, 400);

    await typeInto(page.getByLabel(/^Name/), updatedName);
    await beat(page, 300);

    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(
      page.getByTestId('toast-success').filter({ hasText: SUCCESS_MESSAGES.userUpdated }),
    ).toBeVisible();
    await expect(rowFor(page, newEmail)).toContainText(updatedName);
    await beat(page, 800);

    /* --- Act 4: Admin demonstrates the delete confirmation modal --- */
    await rowFor(page, newEmail).getByTestId('delete-user').click();
    await expect(page.getByTestId('delete-user-modal-message')).toBeVisible();
    await beat(page, 700);
    await page.getByTestId('delete-user-cancel').click();
    await expect(page.getByTestId('delete-user-modal-message')).toHaveCount(0);
    await beat(page, 600);

    await rowFor(page, newEmail).getByTestId('delete-user').click();
    await expect(page.getByTestId('delete-user-modal-message')).toBeVisible();
    await beat(page, 500);
    await page.getByTestId('delete-user-confirm').click();
    await expect(
      page.getByTestId('toast-success').filter({ hasText: SUCCESS_MESSAGES.userDeleted }),
    ).toBeVisible();
    await expect(rowFor(page, newEmail)).toHaveCount(0);
    await beat(page, 800);

    /* --- Act 5: Admin edits a role's permissions, then reverts --- */
    await page.getByTestId('section-roles').scrollIntoViewIfNeeded();
    await beat(page, 500);

    const viewerCard = page.locator('article', { hasText: 'Viewer' }).first();
    await viewerCard.getByTestId('edit-role').click();
    await expect(page.getByTestId('edit-role-form')).toBeVisible();
    await beat(page, 600);

    const deletePermission = page
      .getByTestId('edit-role-form')
      .getByLabel('Delete user', { exact: true });
    const initiallyChecked = await deletePermission.isChecked();
    await deletePermission.click();
    await beat(page, 400);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByTestId('toast-success').filter({ hasText: SUCCESS_MESSAGES.roleUpdated }),
    ).toBeVisible();
    await beat(page, 700);

    // Revert so subsequent runs start from the same state.
    await page.locator('article', { hasText: 'Viewer' }).first().getByTestId('edit-role').click();
    await expect(page.getByTestId('edit-role-form')).toBeVisible();
    const revertPermission = page
      .getByTestId('edit-role-form')
      .getByLabel('Delete user', { exact: true });
    await expect(revertPermission).toBeChecked({ checked: !initiallyChecked });
    await revertPermission.click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByTestId('edit-role-form')).toHaveCount(0);
    await beat(page, 600);

    await logout(page);

    /* --- Act 6: Editor signs in — restricted toolbar --- */
    await loginAs(page, 'editor');
    await expect(page.getByTestId('add-user-button')).toHaveCount(0);
    await expect(page.locator('[data-test="delete-user"]')).toHaveCount(0);
    const editorRoleEdit = page
      .getByTestId('section-roles')
      .locator('[data-test="edit-role"]')
      .first();
    await editorRoleEdit.scrollIntoViewIfNeeded();
    await expect(editorRoleEdit).toBeDisabled();
    await beat(page, 1500);
    await logout(page);

    /* --- Act 7: Viewer signs in — even more restricted --- */
    await loginAs(page, 'viewer');
    await expect(page.getByTestId('section-roles')).toHaveCount(0);
    await expect(page.getByTestId('add-user-button')).toHaveCount(0);
    await expect(page.locator('[data-test="edit-user"]')).toHaveCount(0);
    await expect(page.locator('[data-test="delete-user"]')).toHaveCount(0);
    await expect(page.getByTestId('section-users')).toBeVisible();
    await beat(page, 1500);
    await logout(page);
  });
});
