import { expect, test, type Page } from '@playwright/test';

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
  test('RBAC matrix for dashboard sections, actions, role editing, and header', async ({
    page,
  }) => {
    const scenarios = [
      {
        email: 'admin@test.com' as const,
        showUsersSection: true,
        showRolesSection: true,
        canCreateUser: true,
        canEditUser: true,
        canDeleteUser: true,
        usersRoleColumnVisible: true,
        editRoleButtonEnabled: true,
      },
      {
        email: 'editor@test.com' as const,
        showUsersSection: true,
        showRolesSection: true,
        canCreateUser: false,
        canEditUser: true,
        canDeleteUser: false,
        usersRoleColumnVisible: true,
        editRoleButtonEnabled: false,
      },
      {
        email: 'viewer@test.com' as const,
        showUsersSection: true,
        showRolesSection: false,
        canCreateUser: false,
        canEditUser: false,
        canDeleteUser: false,
        usersRoleColumnVisible: false,
        editRoleButtonEnabled: false,
      },
    ];

    for (const scenario of scenarios) {
      await loginAs(page, scenario.email);

      // Header/nav matrix: all roles see current user + logout.
      await expect(page.getByTestId('current-user-name')).toBeVisible();
      await expect(page.getByTestId('logout-button')).toBeVisible();

      const usersSection = page.getByTestId('section-users');
      const rolesSection = page.getByTestId('section-roles');

      if (scenario.showUsersSection) {
        await expect(usersSection).toBeVisible();
      } else {
        await expect(usersSection).toHaveCount(0);
      }

      if (scenario.showRolesSection) {
        await expect(rolesSection).toBeVisible();
      } else {
        await expect(rolesSection).toHaveCount(0);
      }

      if (scenario.canCreateUser) {
        await expect(page.getByTestId('add-user-button')).toBeVisible();
      } else {
        await expect(page.getByTestId('add-user-button')).toHaveCount(0);
      }

      const editButtons = usersSection.locator('[data-test="edit-user"]');
      const deleteButtons = usersSection.locator('[data-test="delete-user"]');
      if (scenario.canEditUser) {
        await expect(editButtons.first()).toBeVisible();
      } else {
        await expect(editButtons).toHaveCount(0);
      }
      if (scenario.canDeleteUser) {
        await expect(deleteButtons.first()).toBeVisible();
      } else {
        await expect(deleteButtons).toHaveCount(0);
      }

      const usersHeader = usersSection.locator('thead');
      if (scenario.usersRoleColumnVisible) {
        await expect(usersHeader).toContainText('Role');
      } else {
        await expect(usersHeader).not.toContainText('Role');
      }
      if (scenario.canEditUser) {
        await editButtons.first().click();
        const editForm = page.getByTestId('edit-user-form');
        await expect(editForm).toBeVisible();
        await expect(editForm.getByLabel(/^Role/)).toBeEnabled();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByTestId('edit-user-form')).toHaveCount(0);
      }

      const roleEditButtons = page.locator('[data-test="edit-role"]');
      if (!scenario.showRolesSection) {
        await expect(roleEditButtons).toHaveCount(0);
      } else if (scenario.editRoleButtonEnabled) {
        await expect(roleEditButtons.first()).toBeEnabled();
      } else {
        await expect(roleEditButtons.first()).toBeDisabled();
      }

      await page.getByTestId('logout-button').click();
      await expect(page).toHaveURL(/\/login$/);
    }
  });

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

  test('users table action controls are role-based', async ({ page }) => {
    const scenarios = [
      {
        email: 'admin@test.com' as const,
        hasActionsColumn: true,
        hasEditButtons: true,
        hasDeleteButtons: true,
      },
      {
        email: 'editor@test.com' as const,
        hasActionsColumn: true,
        hasEditButtons: true,
        hasDeleteButtons: false,
      },
      {
        email: 'viewer@test.com' as const,
        hasActionsColumn: false,
        hasEditButtons: false,
        hasDeleteButtons: false,
      },
    ];

    for (const scenario of scenarios) {
      await loginAs(page, scenario.email);

      const usersSection = page.getByTestId('section-users');
      const tableHead = usersSection.locator('thead');
      const editButtons = usersSection.locator('[data-test="edit-user"]');
      const deleteButtons = usersSection.locator('[data-test="delete-user"]');

      if (scenario.hasActionsColumn) {
        await expect(tableHead).toContainText('Actions');
      } else {
        await expect(tableHead).not.toContainText('Actions');
      }

      if (scenario.hasEditButtons) {
        await expect(editButtons.first()).toBeVisible();
      } else {
        await expect(editButtons).toHaveCount(0);
      }

      if (scenario.hasDeleteButtons) {
        await expect(deleteButtons.first()).toBeVisible();
      } else {
        await expect(deleteButtons).toHaveCount(0);
      }

      await page.getByTestId('logout-button').click();
      await expect(page).toHaveURL(/\/login$/);
    }
  });

  test('role-based action visibility matrix', async ({ page }) => {
    const scenarios = [
      {
        email: 'admin@test.com' as const,
        showUsersSection: true,
        showRolesSection: true,
        canCreateUser: true,
        canEditUser: true,
        canDeleteUser: true,
        editRoleEnabled: true,
      },
      {
        email: 'editor@test.com' as const,
        showUsersSection: true,
        showRolesSection: true,
        canCreateUser: false,
        canEditUser: true,
        canDeleteUser: false,
        editRoleEnabled: false,
      },
      {
        email: 'viewer@test.com' as const,
        showUsersSection: true,
        showRolesSection: false,
        canCreateUser: false,
        canEditUser: false,
        canDeleteUser: false,
        editRoleEnabled: false,
      },
    ];

    for (const scenario of scenarios) {
      await loginAs(page, scenario.email);

      const usersSection = page.getByTestId('section-users');
      const rolesSection = page.getByTestId('section-roles');

      if (scenario.showUsersSection) {
        await expect(usersSection).toBeVisible();
      } else {
        await expect(usersSection).toHaveCount(0);
      }

      if (scenario.showRolesSection) {
        await expect(rolesSection).toBeVisible();
      } else {
        await expect(rolesSection).toHaveCount(0);
      }

      if (scenario.canCreateUser) {
        await expect(page.getByTestId('add-user-button')).toBeVisible();
      } else {
        await expect(page.getByTestId('add-user-button')).toHaveCount(0);
      }

      const editButtons = page.locator('[data-test="edit-user"]');
      if (scenario.canEditUser) {
        await expect(editButtons.first()).toBeVisible();
      } else {
        await expect(editButtons).toHaveCount(0);
      }

      const deleteButtons = page.locator('[data-test="delete-user"]');
      if (scenario.canDeleteUser) {
        await expect(deleteButtons.first()).toBeVisible();
      } else {
        await expect(deleteButtons).toHaveCount(0);
      }

      const roleEditButtons = page.locator('[data-test="edit-role"]');
      if (!scenario.showRolesSection) {
        await expect(roleEditButtons).toHaveCount(0);
      } else if (scenario.editRoleEnabled) {
        await expect(roleEditButtons.first()).toBeEnabled();
      } else {
        await expect(roleEditButtons.first()).toBeDisabled();
      }

      await page.getByTestId('logout-button').click();
      await expect(page).toHaveURL(/\/login$/);
    }
  });
});
