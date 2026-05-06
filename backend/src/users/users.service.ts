import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Role, RoleName } from '../roles/entities/role.entity';
import {
  PG_ERROR_CODE_UNIQUE_VIOLATION,
} from '../common/constants';
import { ERRORS } from '../common/messages';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const VIEWER_ROLE: RoleName = 'Viewer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async findAll(currentUserRole: RoleName): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: { role: { permissions: true } },
      order: { name: 'ASC' },
    });

    if (currentUserRole === VIEWER_ROLE) {
      return users.map((user) => {
        const stripped: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
        } as User;
        return stripped;
      });
    }

    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { role: { permissions: true } },
    });
    if (!user) {
      throw new NotFoundException(ERRORS.userNotFound(id));
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const role = await this.rolesRepository.findOne({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new NotFoundException(ERRORS.roleNotFound(dto.roleId));
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      status: dto.status,
      role,
    });

    try {
      const saved = await this.usersRepository.save(user);
      return this.findOne(saved.id);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(ERRORS.emailInUse(dto.email));
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.status !== undefined) user.status = dto.status;

    if (dto.roleId !== undefined) {
      const role = await this.rolesRepository.findOne({
        where: { id: dto.roleId },
      });
      if (!role) {
        throw new NotFoundException(ERRORS.roleNotFound(dto.roleId));
      }
      user.role = role;
    }

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          ERRORS.emailInUse(dto.email ?? user.email),
        );
      }
      throw error;
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    const driverError = (error as QueryFailedError & {
      driverError?: { code?: string };
    }).driverError;
    return driverError?.code === PG_ERROR_CODE_UNIQUE_VIOLATION;
  }
}
