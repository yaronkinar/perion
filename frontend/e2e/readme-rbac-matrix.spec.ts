import { expect, test, type Page } from '@playwright/test';

const LABELS = {
  'admin@test.com': 'Admin User — Admin',
  'editor@test.com': 'Editor User — Editor',
  'viewer@test.com': 'Viewer User — Viewer',
} as const;

type UserEmail = keyof typeof LABELS;

interface MatrixScenario {
  email: UserEmail;
  usersTableVisible: boolean;
  addUserVisible: boolean;
  editButtonVisible: boolean;
  deleteButtonVisible: boolean;
  changeRoleDropdownVisible: boolean;
  changeRoleDropdownEnabled: boolean;
  rolesSectionVisible: boolean;
  roleDetailsVisible: boolean;
  editRoleButtonVisible: boolean;
  editRoleButtonEnabled: boolean;
}

async function loginAs(page: Page, email: UserEmail): Promise<void> {
  await page.goto('/login');
  await page
    .getByTestId('user-selector')
    .locator('select')
    .selectOption({ label: LABELS[email] });
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function assertChangeRoleDropdown(
  page: Page,
  expectedVisible: boolean,
  expectedEnabled: boolean,
): Promise<void> {
  const usersSection = page.getByTestId('section-users');
  const editButtons = usersSection.locator('[data-test="edit-user"]');

  if (!expectedVisible) {
    return;
  }

  await editButtons.first().click();
  const editForm = page.getByTestId('edit-user-form');
  await expect(editForm).toBeVisible();

  const roleSelect = editForm.getByLabel(/^Role/);
  await expect(roleSelect).toBeVisible();
  if (expectedEnabled) {
    await expect(roleSelect).toBeEnabled();
  } else {
    await expect(roleSelect).toBeDisabled();
  }

  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByTestId('edit-user-form')).toHaveCount(0);
}

test.describe('README RBAC matrix', () => {
  const scenarios: MatrixScenario[] = [
    {
      email: 'admin@test.com',
      usersTableVisible: true,
      addUserVisible: true,
      editButtonVisible: true,
      deleteButtonVisible: true,
      changeRoleDropdownVisible: true,
      changeRoleDropdownEnabled: true,
      rolesSectionVisible: true,
      roleDetailsVisible: true,
      editRoleButtonVisible: true,
      editRoleButtonEnabled: true,
    },
    {
      email: 'editor@test.com',
      usersTableVisible: true,
      addUserVisible: false,
      editButtonVisible: true,
      deleteButtonVisible: false,
      changeRoleDropdownVisible: true,
      changeRoleDropdownEnabled: true,
      rolesSectionVisible: true,
      roleDetailsVisible: true,
      editRoleButtonVisible: true,
      editRoleButtonEnabled: false,
    },
    {
      email: 'viewer@test.com',
      usersTableVisible: true,
      addUserVisible: false,
      editButtonVisible: false,
      deleteButtonVisible: false,
      changeRoleDropdownVisible: false,
      changeRoleDropdownEnabled: false,
      rolesSectionVisible: false,
      roleDetailsVisible: false,
      editRoleButtonVisible: false,
      editRoleButtonEnabled: false,
    },
  ];

  for (const scenario of scenarios) {
    test(`${scenario.email} matches README matrix`, async ({ page }) => {
      await loginAs(page, scenario.email);

      const usersSection = page.getByTestId('section-users');
      const rolesSection = page.getByTestId('section-roles');
      const addUserButton = page.getByTestId('add-user-button');
      const editButtons = usersSection.locator('[data-test="edit-user"]');
      const deleteButtons = usersSection.locator('[data-test="delete-user"]');
      const roleEditButtons = page.locator('[data-test="edit-role"]');

      await expect(page.getByTestId('current-user-name')).toBeVisible();
      await expect(page.getByTestId('logout-button')).toBeVisible();

      if (scenario.usersTableVisible) {
        await expect(usersSection).toBeVisible();
      } else {
        await expect(usersSection).toHaveCount(0);
      }

      if (scenario.addUserVisible) {
        await expect(addUserButton).toBeVisible();
      } else {
        await expect(addUserButton).toHaveCount(0);
      }

      if (scenario.editButtonVisible) {
        await expect(editButtons.first()).toBeVisible();
      } else {
        await expect(editButtons).toHaveCount(0);
      }

      if (scenario.deleteButtonVisible) {
        await expect(deleteButtons.first()).toBeVisible();
      } else {
        await expect(deleteButtons).toHaveCount(0);
      }

      await assertChangeRoleDropdown(
        page,
        scenario.changeRoleDropdownVisible,
        scenario.changeRoleDropdownEnabled,
      );

      if (scenario.rolesSectionVisible) {
        await expect(rolesSection).toBeVisible();
      } else {
        await expect(rolesSection).toHaveCount(0);
      }

      if (scenario.roleDetailsVisible) {
        await expect(rolesSection).toContainText('View users');
      } else {
        await expect(rolesSection).toHaveCount(0);
      }

      if (scenario.editRoleButtonVisible) {
        await expect(roleEditButtons.first()).toBeVisible();
        if (scenario.editRoleButtonEnabled) {
          await expect(roleEditButtons.first()).toBeEnabled();
        } else {
          await expect(roleEditButtons.first()).toBeDisabled();
        }
      } else {
        await expect(roleEditButtons).toHaveCount(0);
      }

      await page.getByTestId('logout-button').click();
      await expect(page).toHaveURL(/\/login$/);
    });
  }
});
