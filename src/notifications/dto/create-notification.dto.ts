import { IsNotEmpty, IsString, IsEnum, MaxLength, IsOptional } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  customerId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  dealId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  taskId?: string;
}
