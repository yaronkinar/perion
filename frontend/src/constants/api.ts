export const API_BASE_URL = '/api' as const;

export const AUTH_ROUTES = {
  USERS: '/auth/users',
  SELECT: '/auth/select',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
} as const;

export const USERS_ROUTES = {
  COLLECTION: '/users',
  detail: (id: string): string => `/users/${id}`,
} as const;

export const ROLES_ROUTES = {
  COLLECTION: '/roles',
  detail: (id: string): string => `/roles/${id}`,
} as const;

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVER_ERROR: 500,
} as const;
