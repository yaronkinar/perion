import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export type UserStatus = 'active' | 'inactive';

export const USER_STATUS_ACTIVE: UserStatus = 'active';
export const USER_STATUS_INACTIVE: UserStatus = 'inactive';
export const USER_STATUS_VALUES: readonly UserStatus[] = [
  USER_STATUS_ACTIVE,
  USER_STATUS_INACTIVE,
];

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({
    type: 'enum',
    enum: USER_STATUS_VALUES,
    default: USER_STATUS_ACTIVE,
  })
  status!: UserStatus;

  // Stored as a bcrypt hash. Excluded from default selects so it never leaks
  // through generic findOne/find calls; opt in via addSelect() on the auth path.
  @Column({
    name: 'password_hash',
    type: 'text',
    nullable: true,
    select: false,
  })
  passwordHash!: string | null;

  @ManyToOne(() => Role, (role) => role.users, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role!: Role;
}
