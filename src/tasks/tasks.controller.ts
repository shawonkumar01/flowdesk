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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Organization } from '../common/decorators/organization.decorator';
import { OrganizationGuard } from '../common/guards/organization.guard';

@Controller('tasks')
@UseGuards(OrganizationGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.create(createTaskDto, organizationId, userId);
  }

  @Get()
  async findAll(
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryTasksDto,
  ) {
    return this.tasksService.findAll(organizationId, userId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.findOne(id, organizationId, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.update(id, updateTaskDto, organizationId, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Organization() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.remove(id, organizationId, userId);
  }
}
