import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ROUTES } from '../common/constants';
import { MESSAGES } from '../common/messages';
import { RequirePermission } from '../permissions/permissions.decorator';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { CreateUserDto } from './dto/create-user.dto';
import type { UserListItemDto } from './dto/user-list-item.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller(ROUTES.USERS)
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission('view_users')
  findAll(@Req() req: Request): Promise<UserListItemDto[]> {
    const sessionUser = req.session.user;
    if (!sessionUser) {
      throw new UnauthorizedException(MESSAGES.NOT_AUTHENTICATED);
    }
    return this.usersService.findAll(sessionUser.roleName);
  }

  @Post()
  @RequirePermission('create_user')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @RequirePermission('edit_user')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('delete_user')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.usersService.remove(id);
  }
}
