import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DealStage } from '../entities/deal.entity';

export class QueryDealsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
