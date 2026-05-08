import {
  Body,
  Controller,
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
  useSecureCookies,
} from '../common/constants';
import { MESSAGES } from '../common/messages';
import { AuthService } from './auth.service';
import type { PublicUserSummary } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SelectUserDto } from './dto/select-user.dto';
import type { LoginResult } from './auth.service';
import type { SessionUser } from './session.types';

@Controller(ROUTES.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(AUTH_ENDPOINTS.USERS)
  listUsers(): Promise<PublicUserSummary[]> {
    return this.authService.listPublicUsers();
  }

  @Post(AUTH_ENDPOINTS.SELECT)
  @HttpCode(HttpStatus.OK)
  async select(
    @Body() dto: SelectUserDto,
    @Req() req: Request,
  ): Promise<SessionUser> {
    return this.authService.selectUser(dto.userId, req.session);
  }

  @Post(AUTH_ENDPOINTS.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResult> {
    const result = await this.authService.loginWithPassword(
      dto.email,
      dto.password,
    );
    // Seed the session in addition to issuing the JWT, so the existing
    // session-cookie-based checks (PermissionsMiddleware, /auth/me) work for
    // browser clients without a separate JWT integration. Bearer-token
    // clients can still rely solely on the returned `token`.
    req.session.user = result.user;
    res.cookie(JWT_COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: useSecureCookies(),
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
    res.clearCookie(JWT_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: useSecureCookies(),
    });
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
