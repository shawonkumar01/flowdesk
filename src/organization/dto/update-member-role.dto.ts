import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrganizationRole } from '../entities/organization-member.entity';

export class UpdateMemberRoleDto {
  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role: OrganizationRole;
}
