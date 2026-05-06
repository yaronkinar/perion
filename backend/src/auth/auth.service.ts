import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import type { Session, SessionData } from 'express-session';
import { User } from '../users/entities/user.entity';
import type { PermissionAction } from '../permissions/entities/permission.entity';
import { ERRORS, MESSAGES } from '../common/messages';
import type { SessionUser } from './session.types';

type AppSession = Session & Partial<SessionData>;

export interface PublicUserSummary {
  id: string;
  name: string;
  email: string;
  roleName: string;
}

export interface LoginResult {
  token: string;
  user: SessionUser;
}

interface JwtPayload {
  sub: string;
  email: string;
  roleName: string;
  permissions: PermissionAction[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async listPublicUsers(): Promise<PublicUserSummary[]> {
    const users = await this.usersRepository.find({
      relations: { role: true },
      order: { name: 'ASC' },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      roleName: user.role.name,
    }));
  }

  async selectUser(
    userId: string,
    session: AppSession,
  ): Promise<SessionUser> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { role: { permissions: true } },
    });
    if (!user) {
      throw new NotFoundException(ERRORS.userNotFound(userId));
    }

    const sessionUser = this.toSessionUser(user);
    session.user = sessionUser;
    return sessionUser;
  }

  async loginWithPassword(email: string, password: string): Promise<LoginResult> {
    // `passwordHash` is `select: false` on the entity, so we must opt in.
    const user = await this.usersRepository
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .leftJoinAndSelect('u.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('u.email = :email', { email })
      .getOne();

    // Single message + always run bcrypt to dampen email-enumeration timing.
    const hash = user?.passwordHash ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali';
    const matches = await bcrypt.compare(password, hash);
    if (!user || !user.passwordHash || !matches) {
      throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
    }

    const sessionUser = this.toSessionUser(user);
    const payload: JwtPayload = {
      sub: sessionUser.id,
      email: sessionUser.email,
      roleName: sessionUser.roleName,
      permissions: sessionUser.permissions,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token, user: sessionUser };
  }

  async logout(session: AppSession): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      session.destroy((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async getMe(session: AppSession): Promise<SessionUser> {
    const stored = session.user;
    if (!stored) {
      throw new UnauthorizedException(MESSAGES.NO_ACTIVE_SESSION);
    }

    const fresh = await this.usersRepository.findOne({
      where: { id: stored.id },
      relations: { role: { permissions: true } },
    });

    if (!fresh) {
      await this.logout(session);
      throw new UnauthorizedException(MESSAGES.SESSION_USER_GONE);
    }

    const refreshed = this.toSessionUser(fresh);
    session.user = refreshed;
    return refreshed;
  }

  private toSessionUser(user: User): SessionUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      roleId: user.role.id,
      roleName: user.role.name,
      permissions: user.role.permissions.map(
        (permission) => permission.name as PermissionAction,
      ),
    };
  }
}
