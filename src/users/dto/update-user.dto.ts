import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatar?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}
