import { IsNotEmpty, IsString, IsOptional, IsDate, MaxLength, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

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
  assignedTo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  recurringPattern?: string;
}
