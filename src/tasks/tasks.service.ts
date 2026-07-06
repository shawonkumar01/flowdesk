import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Task } from './entities/task.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    organizationId: string,
    userId: string,
  ): Promise<Task> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const { status, priority, ...rest } = createTaskDto;
    const task = this.taskRepository.create({
      ...rest,
      organizationId,
      status: status as any,
      priority: priority as any,
    });

    return this.taskRepository.save(task);
  }

  async findAll(
    organizationId: string,
    userId: string,
    query: QueryTasksDto,
  ) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const where: any = { organizationId };

    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.dealId) {
      where.dealId = query.dealId;
    }

    if (query.assignedTo) {
      where.assignedTo = query.assignedTo;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const [data, total] = await this.taskRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [sortBy]: sortOrder,
      },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const task = await this.taskRepository.findOne({
      where: { id, organizationId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    organizationId: string,
    userId: string,
  ) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const task = await this.taskRepository.findOne({
      where: { id, organizationId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const { status, priority, ...rest } = updateTaskDto;
    await this.taskRepository.update(id, {
      ...rest,
      status: status as any,
      priority: priority as any,
    });

    return this.taskRepository.findOne({ where: { id } });
  }

  async remove(id: string, organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const task = await this.taskRepository.findOne({
      where: { id, organizationId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepository.delete(id);
  }
}
