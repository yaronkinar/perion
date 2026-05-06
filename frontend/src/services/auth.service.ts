import { http, unwrap } from './http';
import { AUTH_ROUTES } from '@/constants/api';
import type { ApiResponse } from '@/types/api.types';
import type {
  PublicUserSummary,
  UserWithPermissions,
} from '@/types/user.types';

export interface LoginResponse {
  token: string;
  user: UserWithPermissions;
}

export const authService = {
  async listUsers(): Promise<PublicUserSummary[]> {
    const response = await http.get<ApiResponse<PublicUserSummary[]>>(
      AUTH_ROUTES.USERS,
    );
    return unwrap(response);
  },

  async selectUser(userId: string): Promise<UserWithPermissions> {
    const response = await http.post<ApiResponse<UserWithPermissions>>(
      AUTH_ROUTES.SELECT,
      { userId },
    );
    return unwrap(response);
  },

  async loginWithPassword(
    email: string,
    password: string,
  ): Promise<LoginResponse> {
    const response = await http.post<ApiResponse<LoginResponse>>(
      AUTH_ROUTES.LOGIN,
      { email, password },
    );
    return unwrap(response);
  },

  async logout(): Promise<void> {
    await http.post(AUTH_ROUTES.LOGOUT);
  },

  async getMe(): Promise<UserWithPermissions> {
    const response = await http.get<ApiResponse<UserWithPermissions>>(
      AUTH_ROUTES.ME,
    );
    return unwrap(response);
  },
};
