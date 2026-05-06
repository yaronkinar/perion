<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout/AppLayout.vue';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
import PermissionGuard from '@/components/permission/PermissionGuard/PermissionGuard.vue';
import UsersTable from '@/components/users/UsersTable/UsersTable.vue';
import AddUserModal from '@/components/users/AddUserModal/AddUserModal.vue';
import EditUserModal from '@/components/users/EditUserModal/EditUserModal.vue';
import RolesList from '@/components/roles/RolesList/RolesList.vue';
import EditRoleModal from '@/components/roles/EditRoleModal/EditRoleModal.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import { useDashboardPage } from './useDashboardPage';

const {
  usersState,
  rolesState,
  showAddUser,
  editingUser,
  editingRole,
  addUserServerErrors,
  editUserServerErrors,
  canViewUsers,
  canViewRoles,
  handleLogout,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleUpdateRole,
} = useDashboardPage();
</script>

<template>
  <AppLayout :title="COPY.dashboardTitle" @logout="handleLogout">
    <div class="space-y-10">
      <section v-if="canViewUsers" :data-test="TEST_IDS.sectionUsers">
        <header class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">
              {{ COPY.usersHeading }}
            </h2>
            <p class="text-sm text-slate-500">
              {{ COPY.usersSubheading }}
            </p>
          </div>
          <PermissionGuard action="create_user" mode="hide">
            <BaseButton
              variant="primary"
              :data-test="TEST_IDS.addUserButton"
              @click="showAddUser = true"
            >
              {{ COPY.addUser }}
            </BaseButton>
          </PermissionGuard>
        </header>
        <UsersTable
          :users="usersState.users.value"
          :loading="usersState.loading.value"
          @edit="(u) => (editingUser = u)"
          @delete="handleDeleteUser"
        />
        <p
          v-if="usersState.error.value"
          class="mt-2 text-sm text-rose-600"
          role="alert"
        >
          {{ usersState.error.value }}
        </p>
      </section>

      <section v-if="canViewRoles" :data-test="TEST_IDS.sectionRoles">
        <header class="mb-4">
          <h2 class="text-lg font-semibold text-slate-900">
            {{ COPY.rolesHeading }}
          </h2>
          <p class="text-sm text-slate-500">
            {{ COPY.rolesSubheading }}
          </p>
        </header>
        <RolesList
          :roles="rolesState.roles.value"
          :loading="rolesState.loading.value"
          @edit="(r) => (editingRole = r)"
        />
        <p
          v-if="rolesState.error.value"
          class="mt-2 text-sm text-rose-600"
          role="alert"
        >
          {{ rolesState.error.value }}
        </p>
      </section>

      <p
        v-if="!canViewUsers && !canViewRoles"
        class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500"
      >
        {{ COPY.noPermissionVisible }}
      </p>
    </div>

    <AddUserModal
      :open="showAddUser"
      :roles="rolesState.roles.value"
      :saving="usersState.saving.value"
      :server-errors="addUserServerErrors"
      @close="showAddUser = false"
      @submit="handleCreateUser"
    />

    <EditUserModal
      :open="editingUser !== null"
      :user="editingUser"
      :roles="rolesState.roles.value"
      :saving="usersState.saving.value"
      :server-errors="editUserServerErrors"
      @close="editingUser = null"
      @submit="handleUpdateUser"
    />

    <EditRoleModal
      :open="editingRole !== null"
      :role="editingRole"
      :all-permissions="rolesState.allPermissions.value"
      :saving="rolesState.saving.value"
      @close="editingRole = null"
      @submit="handleUpdateRole"
    />
  </AppLayout>
</template>
