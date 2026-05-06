export const ERROR_MESSAGES = {
  failedToLoadUsers: 'Failed to load users',
  loginFailed: 'Login failed',
  logoutFailed: 'Logout failed',
  failedToLoadRoles: 'Failed to load roles',
  failedToCreateUser: 'Failed to create user',
  failedToUpdateUser: 'Failed to update user',
  failedToDeleteUser: 'Failed to delete user',
  failedToUpdateRole: 'Failed to update role',
  forbidden: 'You do not have permission for that action.',
  serverError: 'Something went wrong on the server.',
  loginCouldNot: 'Could not sign in. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  signedInAs: (name: string): string => `Signed in as ${name}`,
  signedOut: 'Signed out',
  userCreated: 'User created',
  userUpdated: 'User updated',
  userDeleted: 'User deleted',
  roleUpdated: 'Role updated',
} as const;

export const CONFIRM_MESSAGES = {
  deleteUser: (name: string): string =>
    `Are you sure you want to delete ${name}?`,
} as const;

export const COPY = {
  appTitle: 'Perion RBAC',
  loginHeading: 'Welcome to Perion RBAC',
  loginSubheading: 'Pick a demo user or sign in with email and password.',
  loadingUsers: 'Loading users...',
  noUsersAvailable: 'No users available. Run the backend seed and try again.',
  signIn: 'Sign in',
  signOut: 'Sign out',
  signInAs: 'Sign in as',
  selectAUser: 'Select a user',
  loginTabDemo: 'Demo user',
  loginTabPassword: 'Email & password',
  loginEmailLabel: 'Email',
  loginPasswordLabel: 'Password',
  loginEmailPlaceholder: 'admin@test.com',
  loginPasswordPlaceholder: 'Password123!',
  loginSeedHint:
    'Seeded users: admin@test.com, editor@test.com, viewer@test.com (password: Password123!).',
  dashboardTitle: 'Dashboard',
  usersHeading: 'Users',
  usersSubheading: 'Manage who has access and what they can do.',
  rolesHeading: 'Roles',
  rolesSubheading: 'Define which permissions belong to each role.',
  loadingRoles: 'Loading roles...',
  noRolesFound: 'No roles found.',
  addUser: 'Add User',
  addUserTitle: 'Add user',
  editUserTitle: 'Edit user',
  createUser: 'Create user',
  saveChanges: 'Save changes',
  edit: 'Edit',
  deleteUser: 'Delete',
  cancel: 'Cancel',
  save: 'Save',
  noPermissionsAssigned: 'No permissions assigned.',
  noPermissionVisible:
    'You do not have permission to view any data here yet.',
  editRole: 'Edit Role',
  editRoleTitle: (roleName: string): string =>
    `Edit ${roleName} permissions`,
  editRoleFallbackTitle: 'Edit role',
  editRoleHint: (roleName: string): string =>
    `Toggle the permissions granted to the ${roleName} role.`,
  permissionsCount: (n: number): string =>
    `${n} permission${n === 1 ? '' : 's'}`,
  cannotChangeRoles: "Your role cannot change other users' roles.",
  pickARole: 'Pick a role',
  fieldName: 'Name',
  fieldEmail: 'Email',
  fieldStatus: 'Status',
  fieldRole: 'Role',
  statusActive: 'Active',
  statusInactive: 'Inactive',
  forbiddenTitle: '403 \u2014 Forbidden',
  forbiddenSubtitle:
    'You do not have permission to view this page. Try a different account.',
  notFoundTitle: '404 \u2014 Not Found',
  notFoundSubtitle:
    'The page you are looking for does not exist.',
  backToDashboard: 'Back to dashboard',
  backToLogin: 'Back to login',
} as const;

export const VALIDATION_MESSAGES = {
  nameRequired: 'Name is required',
  emailRequired: 'Email is required',
  emailInvalid: 'Email is invalid',
  roleRequired: 'Role is required',
  passwordRequired: 'Password is required',
  passwordTooShort: 'Password must be at least 8 characters',
} as const;

export const ROUTE_NAMES = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
} as const;

export const TOAST_VARIANTS = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const TOAST_DISMISS_MS = 4000;
