import {
  ALL_PERMISSION_ACTIONS,
  type PermissionAction,
} from '../permissions/entities/permission.entity';
import type { RoleName } from '../roles/entities/role.entity';
import type { UserStatus } from '../users/entities/user.entity';

export const ROLE_NAMES: readonly RoleName[] = [
  'Admin',
  'Editor',
  'Viewer',
] as const;

export const USER_STATUSES: readonly UserStatus[] = [
  'active',
  'inactive',
] as const;

export const PG_ERROR_CODE_UNIQUE_VIOLATION = '23505' as const;

export const SESSION_COOKIE_NAME = 'perion.sid' as const;
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 8;

export const JWT_COOKIE_NAME = 'perion.jwt' as const;
export const JWT_COOKIE_MAX_AGE_MS = 1000 * 60 * 60;
export const DEFAULT_JWT_TTL = '1h' as const;

export const DEFAULT_PORT = 4000;
export const DEFAULT_CORS_ORIGIN = 'http://localhost:3000' as const;
export const NODE_ENV_PRODUCTION = 'production' as const;
export const MIN_SECRET_LENGTH = 32 as const;
export const DEFAULT_BCRYPT_ROUNDS = 10 as const;

export const API_PREFIX = 'api' as const;

export const ROUTES = {
  AUTH: 'auth',
  USERS: 'users',
  ROLES: 'roles',
} as const;

export const AUTH_ENDPOINTS = {
  USERS: 'users',
  SELECT: 'select',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ME: 'me',
} as const;

export const PERMISSIONS_BY_ROLE: Readonly<Record<RoleName, PermissionAction[]>> =
  Object.freeze({
    Admin: [...ALL_PERMISSION_ACTIONS],
    Editor: ['view_users', 'edit_user', 'view_roles', 'change_role'],
    Viewer: ['view_users'],
  });

export function isProduction(): boolean {
  return process.env.NODE_ENV === NODE_ENV_PRODUCTION;
}

/** Session/JWT `Secure` flag; override with COOKIE_SECURE=true|false. */
export function useSecureCookies(): boolean {
  const raw = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (raw === '0' || raw === 'false' || raw === 'no') {
    return false;
  }
  if (raw === '1' || raw === 'true' || raw === 'yes') {
    return true;
  }
  return isProduction();
}

