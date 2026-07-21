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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Organization } from '../common/decorators/organization.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';

@Controller('notes')
@UseGuards(OrganizationGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notesService.create(createNoteDto, organizationId, userId);
  }

  @Get()
  async findAll(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.notesService.findAll(organizationId, userId, customerId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notesService.findOne(id, organizationId, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notesService.update(id, updateNoteDto, organizationId, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notesService.remove(id, organizationId, userId);
  }
}
