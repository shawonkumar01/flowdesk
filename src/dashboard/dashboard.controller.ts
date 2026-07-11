import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Organization } from '../common/decorators/organization.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';

@Controller('dashboard')
@UseGuards(OrganizationGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('statistics')
  async getStatistics(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.dashboardService.getStatistics(organizationId, userId);
  }
}
