import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from '../src/permissions/entities/permission.entity';
import { Role } from '../src/roles/entities/role.entity';
import { RolesService } from '../src/roles/roles.service';

interface MockRepo {
  find: jest.Mock;
  findOne: jest.Mock;
  save: jest.Mock;
}

function makeRepo(): MockRepo {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn((x: unknown) => Promise.resolve(x)),
  };
}

const permA: Permission = {
  id: 'p-a',
  name: 'view_users',
  roles: [],
};
const permB: Permission = {
  id: 'p-b',
  name: 'edit_user',
  roles: [],
};

const editorRole: Role = {
  id: 'role-editor',
  name: 'Editor',
  permissions: [permA],
  users: [],
};

describe('RolesService', () => {
  let service: RolesService;
  let rolesRepo: MockRepo;
  let permsRepo: MockRepo;

  beforeEach(async () => {
    rolesRepo = makeRepo();
    permsRepo = makeRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useValue: rolesRepo },
        { provide: getRepositoryToken(Permission), useValue: permsRepo },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('findAll returns roles with permissions', async () => {
    rolesRepo.find.mockResolvedValue([editorRole]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].permissions).toHaveLength(1);
  });

  it('findOne throws when missing', async () => {
    rolesRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe('updatePermissions', () => {
    it('replaces permission set', async () => {
      const existing = { ...editorRole, permissions: [permA] };
      rolesRepo.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce({ ...existing, permissions: [permA, permB] });
      permsRepo.find.mockResolvedValue([permA, permB]);

      const result = await service.updatePermissions('role-editor', {
        permissionIds: ['p-a', 'p-b'],
      });
      expect(result.permissions).toHaveLength(2);
      expect(rolesRepo.save).toHaveBeenCalled();
    });

    it('clears permissions when empty list given', async () => {
      const existing = { ...editorRole, permissions: [permA] };
      rolesRepo.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce({ ...existing, permissions: [] });

      const result = await service.updatePermissions('role-editor', {
        permissionIds: [],
      });
      expect(result.permissions).toHaveLength(0);
    });

    it('throws BadRequest when permission ids do not all resolve', async () => {
      rolesRepo.findOne.mockResolvedValue({ ...editorRole });
      permsRepo.find.mockResolvedValue([permA]);
      await expect(
        service.updatePermissions('role-editor', {
          permissionIds: ['p-a', 'missing'],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
