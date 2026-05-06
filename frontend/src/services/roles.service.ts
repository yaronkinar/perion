import { http, unwrap } from './http';
import { ROLES_ROUTES } from '@/constants/api';
import type { ApiResponse } from '@/types/api.types';
import type { Role, UpdateRoleDto } from '@/types/role.types';

export const rolesService = {
  async getRoles(): Promise<Role[]> {
    const response = await http.get<ApiResponse<Role[]>>(
      ROLES_ROUTES.COLLECTION,
    );
    return unwrap(response);
  },

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const response = await http.put<ApiResponse<Role>>(
      ROLES_ROUTES.detail(id),
      dto,
    );
    return unwrap(response);
  },
};
