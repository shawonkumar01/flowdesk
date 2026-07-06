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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Organization } from '../common/decorators/organization.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';

@Controller('customers')
@UseGuards(OrganizationGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.customersService.create(createCustomerDto, organizationId, userId);
  }

  @Get()
  async findAll(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryCustomersDto,
  ) {
    return this.customersService.findAll(organizationId, userId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.customersService.findOne(id, organizationId, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.customersService.update(id, updateCustomerDto, organizationId, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.customersService.remove(id, organizationId, userId);
  }
}
