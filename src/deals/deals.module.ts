import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { Deal } from './entities/deal.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deal, OrganizationMember])],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
