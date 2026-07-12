import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Organization } from '../common/decorators/organization.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';

@Controller('notifications')
@UseGuards(OrganizationGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.create(createNotificationDto, organizationId, userId);
  }

  @Get()
  async findAll(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.findAll(organizationId, userId);
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, organizationId, userId);
  }

  @Put('read-all')
  async markAllAsRead(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAllAsRead(organizationId, userId);
  }
}
