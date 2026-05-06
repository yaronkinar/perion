import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Role } from '../src/roles/entities/role.entity';
import { User } from '../src/users/entities/user.entity';
import { UsersService } from '../src/users/users.service';

interface MockRepo<T> {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  _t?: T;
}

function makeRepo<T>(): MockRepo<T> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x: Partial<T>) => x as T),
    save: jest.fn((x: T) => Promise.resolve(x)),
    remove: jest.fn(),
  };
}

const adminRole: Role = {
  id: 'role-admin',
  name: 'Admin',
  permissions: [],
  users: [],
};

const viewerRole: Role = {
  id: 'role-viewer',
  name: 'Viewer',
  permissions: [],
  users: [],
};

const sampleUsers: User[] = [
  {
    id: 'u1',
    name: 'Admin',
    email: 'admin@test.com',
    status: 'active',
    passwordHash: null,
    role: adminRole,
  },
  {
    id: 'u2',
    name: 'Viewer',
    email: 'viewer@test.com',
    status: 'active',
    passwordHash: null,
    role: viewerRole,
  },
];

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: MockRepo<User>;
  let rolesRepo: MockRepo<Role>;

  beforeEach(async () => {
    usersRepo = makeRepo<User>();
    rolesRepo = makeRepo<Role>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepo },
        { provide: getRepositoryToken(Role), useValue: rolesRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('returns all users with role for Admin', async () => {
      usersRepo.find.mockResolvedValue(sampleUsers);
      const result = await service.findAll('Admin');
      expect(result).toHaveLength(2);
      expect(result[0].role).toBeDefined();
    });

    it('strips role field when caller is Viewer', async () => {
      usersRepo.find.mockResolvedValue(sampleUsers);
      const result = await service.findAll('Viewer');
      expect(result).toHaveLength(2);
      result.forEach((u) => {
        expect((u as User).role).toBeUndefined();
      });
    });
  });

  describe('findOne', () => {
    it('returns the user when found', async () => {
      usersRepo.findOne.mockResolvedValue(sampleUsers[0]);
      const user = await service.findOne('u1');
      expect(user.id).toBe('u1');
    });

    it('throws NotFoundException when missing', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a user when role exists', async () => {
      rolesRepo.findOne.mockResolvedValue(adminRole);
      const created: User = {
        id: 'new',
        name: 'New',
        email: 'n@test.com',
        status: 'active',
        passwordHash: null,
        role: adminRole,
      };
      usersRepo.save.mockResolvedValue(created);
      usersRepo.findOne.mockResolvedValue(created);

      const user = await service.create({
        name: 'New',
        email: 'n@test.com',
        status: 'active',
        roleId: 'role-admin',
      });

      expect(user.email).toBe('n@test.com');
      expect(usersRepo.create).toHaveBeenCalled();
      expect(usersRepo.save).toHaveBeenCalled();
    });

    it('throws when role is missing', async () => {
      rolesRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({
          name: 'X',
          email: 'x@test.com',
          status: 'active',
          roleId: 'missing',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('translates unique-violation into ConflictException', async () => {
      rolesRepo.findOne.mockResolvedValue(adminRole);
      const driverError: Error & { code: string } = Object.assign(
        new Error('duplicate'),
        { code: '23505' },
      );
      const dupErr = new QueryFailedError('q', [], driverError);
      usersRepo.save.mockRejectedValue(dupErr);

      await expect(
        service.create({
          name: 'Dup',
          email: 'admin@test.com',
          status: 'active',
          roleId: 'role-admin',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('updates name and persists', async () => {
      const existing = { ...sampleUsers[0] };
      usersRepo.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce({ ...existing, name: 'Updated' });

      const result = await service.update('u1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
      expect(usersRepo.save).toHaveBeenCalled();
    });

    it('changes role when roleId is provided', async () => {
      const existing = { ...sampleUsers[0] };
      usersRepo.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce({ ...existing, role: viewerRole });
      rolesRepo.findOne.mockResolvedValue(viewerRole);

      const result = await service.update('u1', { roleId: 'role-viewer' });
      expect(result.role.name).toBe('Viewer');
    });
  });

  describe('remove', () => {
    it('removes the user', async () => {
      usersRepo.findOne.mockResolvedValue(sampleUsers[0]);
      await service.remove('u1');
      expect(usersRepo.remove).toHaveBeenCalledWith(sampleUsers[0]);
    });
  });
});
