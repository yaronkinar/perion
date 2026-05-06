import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { ERRORS, MESSAGES } from '../common/messages';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: { permissions: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(ERRORS.roleNotFound(id));
    }
    return role;
  }

  async updatePermissions(
    id: string,
    dto: UpdateRoleDto,
  ): Promise<Role> {
    const role = await this.findOne(id);

    if (dto.permissionIds.length === 0) {
      role.permissions = [];
    } else {
      const permissions = await this.permissionsRepository.find({
        where: { id: In(dto.permissionIds) },
      });
      if (permissions.length !== dto.permissionIds.length) {
        throw new BadRequestException(MESSAGES.INVALID_PERMISSION_IDS);
      }
      role.permissions = permissions;
    }

    await this.rolesRepository.save(role);
    return this.findOne(id);
  }
}
