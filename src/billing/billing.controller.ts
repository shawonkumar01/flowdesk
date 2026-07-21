import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Organization } from '../common/decorators/organization.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';

@Controller('billing')
@UseGuards(OrganizationGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('subscribe')
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billingService.create(createSubscriptionDto, organizationId, userId);
  }

  @Get('subscription')
  async findOne(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billingService.findOne(organizationId, userId);
  }

  @Put('subscription')
  async update(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billingService.update(organizationId, updateSubscriptionDto, userId);
  }

  @Delete('subscription')
  async cancel(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billingService.cancel(organizationId, userId);
  }
}
