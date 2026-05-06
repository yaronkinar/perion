import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import {
  ALL_PERMISSION_ACTIONS,
  Permission,
  PermissionAction,
} from '../permissions/entities/permission.entity';
import { Role, RoleName } from '../roles/entities/role.entity';
import { USER_STATUS_ACTIVE, User } from '../users/entities/user.entity';
import {
  DEFAULT_BCRYPT_ROUNDS,
  PERMISSIONS_BY_ROLE,
  ROLE_NAMES,
} from '../common/constants';
import { LOG_MESSAGES } from '../common/messages';

interface RoleSeed {
  name: RoleName;
  permissions: PermissionAction[];
}

interface UserSeed {
  name: string;
  email: string;
  roleName: RoleName;
}

const ROLE_SEEDS: RoleSeed[] = ROLE_NAMES.map((name) => ({
  name,
  permissions: [...PERMISSIONS_BY_ROLE[name]],
}));

const USER_SEEDS: UserSeed[] = [
  { name: 'Admin User', email: 'admin@test.com', roleName: 'Admin' },
  { name: 'Editor User', email: 'editor@test.com', roleName: 'Editor' },
  { name: 'Viewer User', email: 'viewer@test.com', roleName: 'Viewer' },
];

const DEFAULT_SEED_PASSWORD = 'Password123!';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedUsers();
    await this.seedUserPasswords();
  }

  private async seedPermissions(): Promise<void> {
    for (const action of ALL_PERMISSION_ACTIONS) {
      const existing = await this.permissionsRepository.findOne({
        where: { name: action },
      });
      if (!existing) {
        await this.permissionsRepository.save(
          this.permissionsRepository.create({ name: action }),
        );
        this.logger.log(LOG_MESSAGES.seededPermission(action));
      }
    }
  }

  private async seedRoles(): Promise<void> {
    const allPermissions = await this.permissionsRepository.find();
    const byName = new Map<PermissionAction, Permission>(
      allPermissions.map((p) => [p.name, p]),
    );

    for (const seed of ROLE_SEEDS) {
      const existing = await this.rolesRepository.findOne({
        where: { name: seed.name },
        relations: { permissions: true },
      });

      const desiredPermissions = seed.permissions
        .map((name) => byName.get(name))
        .filter((p): p is Permission => Boolean(p));

      if (!existing) {
        await this.rolesRepository.save(
          this.rolesRepository.create({
            name: seed.name,
            permissions: desiredPermissions,
          }),
        );
        this.logger.log(LOG_MESSAGES.seededRole(seed.name));
        continue;
      }

      const existingIds = new Set(existing.permissions.map((p) => p.id));
      const desiredIds = new Set(desiredPermissions.map((p) => p.id));
      const sameSize = existingIds.size === desiredIds.size;
      const sameMembers =
        sameSize && [...existingIds].every((id) => desiredIds.has(id));

      if (!sameMembers) {
        existing.permissions = desiredPermissions;
        await this.rolesRepository.save(existing);
        this.logger.log(LOG_MESSAGES.syncedRolePermissions(seed.name));
      }
    }
  }

  private async seedUsers(): Promise<void> {
    const roles = await this.rolesRepository.find();
    const byName = new Map<RoleName, Role>(
      roles.map((role) => [role.name, role]),
    );

    for (const seed of USER_SEEDS) {
      const existing = await this.usersRepository.findOne({
        where: { email: seed.email },
      });
      if (existing) continue;

      const role = byName.get(seed.roleName);
      if (!role) {
        this.logger.warn(
          LOG_MESSAGES.missingRoleForUser(seed.roleName, seed.email),
        );
        continue;
      }

      await this.usersRepository.save(
        this.usersRepository.create({
          name: seed.name,
          email: seed.email,
          status: USER_STATUS_ACTIVE,
          role,
        }),
      );
      this.logger.log(LOG_MESSAGES.seededUser(seed.email));
    }
  }

  private async seedUserPasswords(): Promise<void> {
    // Backfill bcrypt hashes for any seeded user that doesn't have one yet.
    // Only the predefined seed emails are touched, never user-created accounts.
    const seedEmails = USER_SEEDS.map((seed) => seed.email);
    const seededUsers = await this.usersRepository
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email IN (:...emails)', { emails: seedEmails })
      .getMany();

    const usersNeedingPassword = seededUsers.filter((user) => !user.passwordHash);

    await Promise.all(
      usersNeedingPassword.map(async (user) => {
        user.passwordHash = await bcrypt.hash(
          DEFAULT_SEED_PASSWORD,
          DEFAULT_BCRYPT_ROUNDS,
        );
        await this.usersRepository.save(user);
        this.logger.log(LOG_MESSAGES.seededUserPassword(user.email));
      }),
    );
  }
}
