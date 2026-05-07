<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout/AppLayout.vue';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
import PermissionGuard from '@/components/permission/PermissionGuard/PermissionGuard.vue';
import UiSectionHeading from '@/components/ui/primitives/UiSectionHeading.vue';
import UiStack from '@/components/ui/primitives/UiStack.vue';
import UiSurface from '@/components/ui/primitives/UiSurface.vue';
import UiText from '@/components/ui/primitives/UiText.vue';
import UsersTable from '@/components/users/UsersTable/UsersTable.vue';
import AddUserModal from '@/components/users/AddUserModal/AddUserModal.vue';
import DeleteUserModal from '@/components/users/DeleteUserModal/DeleteUserModal.vue';
import EditUserModal from '@/components/users/EditUserModal/EditUserModal.vue';
import RolesList from '@/components/roles/RolesList/RolesList.vue';
import EditRoleModal from '@/components/roles/EditRoleModal/EditRoleModal.vue';
import { COPY } from '@/constants/messages';
import { TEST_IDS } from '@/constants/test-ids';
import type { Role } from '@/types/role.types';
import { useDashboardPage } from './useDashboardPage';

const {
  usersState,
  rolesState,
  showAddUser,
  editingUser,
  deletingUser,
  editingRole,
  addUserServerErrors,
  editUserServerErrors,
  canViewUsers,
  canViewRoles,
  handleLogout,
  handleCreateUser,
  handleUpdateUser,
  requestDeleteUser,
  cancelDeleteUser,
  confirmDeleteUser,
  handleUpdateRole,
} = useDashboardPage();
</script>

<template>
  <AppLayout :title="COPY.dashboardTitle" @logout="handleLogout">
    <UiStack gap="10">
      <section v-if="canViewUsers" :data-test="TEST_IDS.sectionUsers">
        <UiSectionHeading layout="split">
          <template #title>
            <UiText variant="sectionTitle">{{ COPY.usersHeading }}</UiText>
          </template>
          <template #description>
            <UiText variant="sectionDescription">{{ COPY.usersSubheading }}</UiText>
          </template>
          <template #action>
            <PermissionGuard action="create_user" mode="hide">
              <BaseButton
                variant="primary"
                :data-test="TEST_IDS.addUserButton"
                @click="showAddUser = true"
              >
                {{ COPY.addUser }}
              </BaseButton>
            </PermissionGuard>
          </template>
        </UiSectionHeading>
        <UsersTable
          :users="usersState.users.value"
          :loading="usersState.loading.value"
          @edit="(u) => (editingUser = u)"
          @delete="requestDeleteUser"
        />
        <UiText v-if="usersState.error.value" variant="errorMt" role="alert">
          {{ usersState.error.value }}
        </UiText>
      </section>

      <section v-if="canViewRoles" :data-test="TEST_IDS.sectionRoles">
        <UiSectionHeading layout="stack">
          <template #title>
            <UiText variant="sectionTitle">{{ COPY.rolesHeading }}</UiText>
          </template>
          <template #description>
            <UiText variant="sectionDescription">{{ COPY.rolesSubheading }}</UiText>
          </template>
        </UiSectionHeading>
        <RolesList
          :roles="rolesState.roles.value"
          :loading="rolesState.loading.value"
          @edit="(r: Role) => (editingRole = r)"
        />
        <UiText v-if="rolesState.error.value" variant="errorMt" role="alert">
          {{ rolesState.error.value }}
        </UiText>
      </section>

      <UiSurface v-if="!canViewUsers && !canViewRoles" variant="notice">
        {{ COPY.noPermissionVisible }}
      </UiSurface>
    </UiStack>

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

    <DeleteUserModal
      :open="deletingUser !== null"
      :user="deletingUser"
      :saving="usersState.saving.value"
      @close="cancelDeleteUser"
      @confirm="confirmDeleteUser"
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
