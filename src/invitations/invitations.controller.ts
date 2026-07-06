import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Organization } from '../common/decorators/organization.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('invitations')
@UseGuards(OrganizationGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  async create(
    @Body() createInvitationDto: CreateInvitationDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.create(createInvitationDto, organizationId, userId);
  }

  @Get()
  async findAll(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.findAll(organizationId, userId);
  }

  @Public()
  @Post(':token/accept')
  async accept(
    @Param('token') token: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.accept(token, userId);
  }

  @Public()
  @Post(':token/decline')
  async decline(
    @Param('token') token: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.decline(token, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.remove(id, organizationId, userId);
  }
}
