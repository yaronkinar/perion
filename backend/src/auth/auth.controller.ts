import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  AUTH_ENDPOINTS,
  JWT_COOKIE_MAX_AGE_MS,
  JWT_COOKIE_NAME,
  ROUTES,
  allowDemoAuth,
  isProduction,
} from '../common/constants';
import { MESSAGES } from '../common/messages';
import { AuthService, PublicUserSummary } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SelectUserDto } from './dto/select-user.dto';
import type { LoginResult } from './auth.service';
import type { SessionUser } from './session.types';

@Controller(ROUTES.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(AUTH_ENDPOINTS.USERS)
  listUsers(): Promise<PublicUserSummary[]> {
    if (!allowDemoAuth()) {
      throw new ForbiddenException(MESSAGES.DEMO_AUTH_DISABLED);
    }
    return this.authService.listPublicUsers();
  }

  @Post(AUTH_ENDPOINTS.SELECT)
  @HttpCode(HttpStatus.OK)
  async select(
    @Body() dto: SelectUserDto,
    @Req() req: Request,
  ): Promise<SessionUser> {
    if (!allowDemoAuth()) {
      throw new ForbiddenException(MESSAGES.DEMO_AUTH_DISABLED);
    }
    return this.authService.selectUser(dto.userId, req.session);
  }

  @Post(AUTH_ENDPOINTS.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResult> {
    const result = await this.authService.loginWithPassword(
      dto.email,
      dto.password,
    );
    res.cookie(JWT_COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction(),
      maxAge: JWT_COOKIE_MAX_AGE_MS,
    });
    return result;
  }

  @Post(AUTH_ENDPOINTS.LOGOUT)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    await this.authService.logout(req.session);
    res.clearCookie(JWT_COOKIE_NAME);
    return { ok: true };
  }

  @Get(AUTH_ENDPOINTS.ME)
  async me(@Req() req: Request): Promise<SessionUser> {
    if (!req.session.user) {
      throw new UnauthorizedException(MESSAGES.NOT_AUTHENTICATED);
    }
    return this.authService.getMe(req.session);
  }
}
