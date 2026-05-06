export const MESSAGES = {
  OK: 'OK',
  ERROR: 'Error',
  INTERNAL_ERROR: 'Internal server error',
  UNKNOWN_EXCEPTION: 'Unknown exception',
  NOT_AUTHENTICATED: 'Not authenticated',
  NO_ACTIVE_SESSION: 'No active session',
  SESSION_USER_GONE: 'Session user no longer exists',
  INVALID_PERMISSION_IDS: 'One or more permission ids are invalid',
  INVALID_CREDENTIALS: 'Invalid email or password',
  MISSING_PERMISSION_METADATA:
    'Endpoint missing permission metadata; refusing access',
  DEMO_AUTH_DISABLED: 'Demo authentication is disabled in this environment',
  ACCESS_DENIED: 'Access denied',
} as const;

export const ERRORS = {
  userIdNotUuid: 'userId must be a valid UUID',
  userNotFound: (id: string): string => `User ${id} not found`,
  emailInUse: (email: string): string => `Email ${email} is already in use`,
  roleNotFound: (id: string): string => `Role ${id} not found`,
  missingPermission: (action: string): string =>
    `Missing required permission: ${action}`,
  databaseUrlRequired: 'DATABASE_URL is required',
  sessionSecretRequired:
    'SESSION_SECRET is required (>=32 chars in production)',
  jwtSecretRequired: 'JWT_SECRET is required (>=32 chars in production)',
} as const;

export const LOG_MESSAGES = {
  seededPermission: (name: string): string => `Seeded permission ${name}`,
  seededRole: (name: string): string => `Seeded role ${name}`,
  syncedRolePermissions: (name: string): string =>
    `Synced permissions for role ${name}`,
  seededUser: (email: string): string => `Seeded user ${email}`,
  seededUserPassword: (email: string): string =>
    `Seeded password for user ${email}`,
  missingRoleForUser: (roleName: string, email: string): string =>
    `Role ${roleName} missing while seeding user ${email}`,
  backendListening: (port: number): string =>
    `Backend listening on http://localhost:${port}/api`,
} as const;
