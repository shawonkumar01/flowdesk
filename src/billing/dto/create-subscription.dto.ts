import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Plan } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsEnum(Plan)
  plan: Plan;

  @IsString()
  @IsOptional()
  stripeCustomerId?: string;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}
