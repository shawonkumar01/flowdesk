import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { QueryActivityLogsDto } from './dto/query-activity-logs.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Organization } from '../common/decorators/organization.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';

@Controller('activity-logs')
@UseGuards(OrganizationGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  async create(
    @Body() createActivityLogDto: CreateActivityLogDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.activityService.create(createActivityLogDto, organizationId, userId);
  }

  @Get()
  async findAll(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryActivityLogsDto,
  ) {
    return this.activityService.findAll(organizationId, userId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.activityService.findOne(id, organizationId, userId);
  }
}
