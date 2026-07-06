import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  stage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  currency?: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
