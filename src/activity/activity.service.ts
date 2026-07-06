import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { QueryActivityLogsDto } from './dto/query-activity-logs.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
  ) {}

  async create(
    createActivityLogDto: CreateActivityLogDto,
    organizationId: string,
    userId: string,
  ): Promise<ActivityLog> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const { action, ...rest } = createActivityLogDto;
    const activityLog = this.activityLogRepository.create({
      ...rest,
      organizationId,
      userId,
      action: action as any,
    });

    return this.activityLogRepository.save(activityLog);
  }

  async findAll(
    organizationId: string,
    userId: string,
    query: QueryActivityLogsDto,
  ) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const where: any = { organizationId };

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const [data, total] = await this.activityLogRepository.findAndCount({
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

    const activityLog = await this.activityLogRepository.findOne({
      where: { id, organizationId },
    });

    if (!activityLog) {
      throw new NotFoundException('Activity log not found');
    }

    return activityLog;
  }
}
