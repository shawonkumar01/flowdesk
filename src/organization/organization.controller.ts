import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { OrganizationRole } from './entities/organization-member.entity';

@Controller('organizations')
@UseGuards(OrganizationGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationService.create(createOrganizationDto, userId);
  }

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.organizationService.findAll(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationService.findOne(id, userId);
  }

  @Put(':id')
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationService.update(id, updateOrganizationDto, userId);
  }

  @Delete(':id')
  @Roles(OrganizationRole.OWNER)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationService.remove(id, userId);
  }

  @Post(':id/members')
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationService.addMember(id, addMemberDto, userId);
  }

  @Get(':id/members')
  async getMembers(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationService.getMembers(id, userId);
  }

  @Delete(':id/members/:memberId')
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationService.removeMember(id, memberId, userId);
  }

  @Put(':id/members/:memberId/role')
  @Roles(OrganizationRole.OWNER)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationService.updateMemberRole(
      id,
      memberId,
      updateMemberRoleDto,
      userId,
    );
  }
}
