import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Subscription } from './entities/subscription.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, OrganizationMember])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
