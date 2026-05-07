import type { RoleName } from '../../roles/entities/role.entity';
import type { UserStatus } from '../entities/user.entity';

export interface UserRoleSummaryDto {
  id: string;
  name: RoleName;
}

export interface UserListItemDto {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role?: UserRoleSummaryDto;
}
