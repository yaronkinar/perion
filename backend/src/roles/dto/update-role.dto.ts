import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class UpdateRoleDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}
