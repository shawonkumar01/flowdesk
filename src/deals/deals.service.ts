import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Deal } from './entities/deal.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { QueryDealsDto } from './dto/query-deals.dto';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
  ) {}

  async create(
    createDealDto: CreateDealDto,
    organizationId: string,
    userId: string,
  ): Promise<Deal> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const { stage, ...rest } = createDealDto;
    const deal = this.dealRepository.create({
      ...rest,
      organizationId,
      stage: stage as any,
    });

    return this.dealRepository.save(deal);
  }

  async findAll(
    organizationId: string,
    userId: string,
    query: QueryDealsDto,
  ) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const where: FindOptionsWhere<Deal> = { organizationId };

    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    if (query.stage) {
      where.stage = query.stage;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.assignedTo) {
      where.assignedTo = query.assignedTo;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const [data, total] = await this.dealRepository.findAndCount({
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

  async getStatistics(organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const totalDeals = await this.dealRepository.count({
      where: { organizationId },
    });

    const dealsByStage = await this.dealRepository
      .createQueryBuilder('deal')
      .select('deal.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(deal.amount)', 'totalAmount')
      .where('deal.organizationId = :organizationId', { organizationId })
      .groupBy('deal.stage')
      .getRawMany();

    const totalValue = await this.dealRepository
      .createQueryBuilder('deal')
      .select('SUM(deal.amount)', 'total')
      .where('deal.organizationId = :organizationId', { organizationId })
      .getRawOne();

    return {
      totalDeals,
      totalValue: totalValue?.total || 0,
      dealsByStage,
    };
  }

  async findOne(id: string, organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const deal = await this.dealRepository.findOne({
      where: { id, organizationId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async update(
    id: string,
    updateDealDto: UpdateDealDto,
    organizationId: string,
    userId: string,
  ) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const deal = await this.dealRepository.findOne({
      where: { id, organizationId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const { stage, ...rest } = updateDealDto;
    await this.dealRepository.update(id, {
      ...rest,
      stage: stage as any,
    });

    return this.dealRepository.findOne({ where: { id } });
  }

  async remove(id: string, organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const deal = await this.dealRepository.findOne({
      where: { id, organizationId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    await this.dealRepository.delete(id);
  }
}
