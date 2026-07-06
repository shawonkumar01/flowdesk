import { IsNotEmpty, IsString, IsEnum, MaxLength, IsOptional } from 'class-validator';
import { ActivityAction } from '../entities/activity-log.entity';

export class CreateActivityLogDto {
  @IsEnum(ActivityAction)
  @IsNotEmpty()
  action: ActivityAction;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  entityType: string;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  changes?: string;
}
