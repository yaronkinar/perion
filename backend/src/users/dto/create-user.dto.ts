import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { USER_STATUSES } from '../../common/constants';
import type { UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsEnum(USER_STATUSES)
  status!: UserStatus;

  @IsUUID('4')
  roleId!: string;
}
