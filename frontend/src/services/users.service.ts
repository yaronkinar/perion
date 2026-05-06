import { http, unwrap } from './http';
import { USERS_ROUTES } from '@/constants/api';
import type { ApiResponse } from '@/types/api.types';
import type {
  CreateUserDto,
  UpdateUserDto,
  User,
} from '@/types/user.types';

export const usersService = {
  async getUsers(): Promise<User[]> {
    const response = await http.get<ApiResponse<User[]>>(
      USERS_ROUTES.COLLECTION,
    );
    return unwrap(response);
  },

  async createUser(dto: CreateUserDto): Promise<User> {
    const response = await http.post<ApiResponse<User>>(
      USERS_ROUTES.COLLECTION,
      dto,
    );
    return unwrap(response);
  },

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const response = await http.put<ApiResponse<User>>(
      USERS_ROUTES.detail(id),
      dto,
    );
    return unwrap(response);
  },

  async deleteUser(id: string): Promise<void> {
    await http.delete(USERS_ROUTES.detail(id));
  },
};
