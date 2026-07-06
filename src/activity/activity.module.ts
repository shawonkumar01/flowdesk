import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ActivityLog } from './entities/activity-log.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog, OrganizationMember])],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
