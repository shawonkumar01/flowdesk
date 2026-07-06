import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { QueryDealsDto } from './dto/query-deals.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Organization } from '../common/decorators/organization.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';

@Controller('deals')
@UseGuards(OrganizationGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  async create(
    @Body() createDealDto: CreateDealDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.dealsService.create(createDealDto, organizationId, userId);
  }

  @Get()
  async findAll(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryDealsDto,
  ) {
    return this.dealsService.findAll(organizationId, userId, query);
  }

  @Get('statistics')
  async getStatistics(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.dealsService.getStatistics(organizationId, userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.dealsService.findOne(id, organizationId, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.dealsService.update(id, updateDealDto, organizationId, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.dealsService.remove(id, organizationId, userId);
  }
}
