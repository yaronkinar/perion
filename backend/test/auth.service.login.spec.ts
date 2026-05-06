import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { Permission } from '../src/permissions/entities/permission.entity';
import { Role } from '../src/roles/entities/role.entity';
import { User } from '../src/users/entities/user.entity';

interface QueryBuilderMock {
  addSelect: jest.Mock;
  leftJoinAndSelect: jest.Mock;
  where: jest.Mock;
  getOne: jest.Mock;
}

function makeQueryBuilder(getOneResult: User | null): QueryBuilderMock {
  const qb: QueryBuilderMock = {
    addSelect: jest.fn(),
    leftJoinAndSelect: jest.fn(),
    where: jest.fn(),
    getOne: jest.fn().mockResolvedValue(getOneResult),
  };
  qb.addSelect.mockReturnValue(qb);
  qb.leftJoinAndSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  return qb;
}

const viewPermission: Permission = {
  id: 'p1',
  name: 'view_users',
  roles: [],
};

const adminRole: Role = {
  id: 'role-admin',
  name: 'Admin',
  permissions: [viewPermission],
  users: [],
};

const PASSWORD = 'Password123!';

async function makeAdminUser(): Promise<User> {
  return {
    id: 'u-admin',
    name: 'Admin User',
    email: 'admin@test.com',
    status: 'active',
    passwordHash: await bcrypt.hash(PASSWORD, 4),
    role: adminRole,
  };
}

describe('AuthService.loginWithPassword', () => {
  let service: AuthService;
  let createQueryBuilder: jest.Mock;
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    createQueryBuilder = jest.fn();
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed.jwt.value') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: { createQueryBuilder, find: jest.fn(), findOne: jest.fn() },
        },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('returns a token + user on valid credentials', async () => {
    const user = await makeAdminUser();
    createQueryBuilder.mockReturnValue(makeQueryBuilder(user));

    const result = await service.loginWithPassword(user.email, PASSWORD);

    expect(result.token).toBe('signed.jwt.value');
    expect(result.user.email).toBe(user.email);
    expect(result.user.permissions).toEqual(['view_users']);
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: user.id,
        email: user.email,
        roleName: 'Admin',
        permissions: ['view_users'],
      }),
    );
  });

  it('rejects unknown emails with InvalidCredentials (no enumeration)', async () => {
    createQueryBuilder.mockReturnValue(makeQueryBuilder(null));
    await expect(
      service.loginWithPassword('nobody@test.com', PASSWORD),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects wrong password with InvalidCredentials', async () => {
    const user = await makeAdminUser();
    createQueryBuilder.mockReturnValue(makeQueryBuilder(user));
    await expect(
      service.loginWithPassword(user.email, 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects users with no password hash with InvalidCredentials', async () => {
    const user = await makeAdminUser();
    user.passwordHash = null;
    createQueryBuilder.mockReturnValue(makeQueryBuilder(user));
    await expect(
      service.loginWithPassword(user.email, PASSWORD),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
