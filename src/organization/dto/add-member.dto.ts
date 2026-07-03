import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { OrganizationRole } from '../entities/organization-member.entity';

export class AddMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role: OrganizationRole;
}
