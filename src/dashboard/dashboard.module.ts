import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Deal } from '../deals/entities/deal.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationMember, Customer, Deal, Task])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
