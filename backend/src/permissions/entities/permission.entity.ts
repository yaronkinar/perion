import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export type PermissionAction =
  | 'view_users'
  | 'create_user'
  | 'edit_user'
  | 'delete_user'
  | 'view_roles'
  | 'edit_roles'
  | 'change_role';

export const ALL_PERMISSION_ACTIONS: readonly PermissionAction[] = [
  'view_users',
  'create_user',
  'edit_user',
  'delete_user',
  'view_roles',
  'edit_roles',
  'change_role',
] as const;

@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: PermissionAction;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}
