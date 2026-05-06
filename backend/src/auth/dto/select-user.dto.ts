import { IsNotEmpty, IsUUID } from 'class-validator';
import { ERRORS } from '../../common/messages';

export class SelectUserDto {
  @IsUUID('4', { message: ERRORS.userIdNotUuid })
  @IsNotEmpty()
  userId!: string;
}
