import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Deal } from '../deals/entities/deal.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getStatistics(organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const totalCustomers = await this.customerRepository.count({
      where: { organizationId },
    });

    const totalDeals = await this.dealRepository.count({
      where: { organizationId },
    });

    const totalTasks = await this.taskRepository.count({
      where: { organizationId },
    });

    const totalMembers = await this.memberRepository.count({
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

    const totalDealValue = await this.dealRepository
      .createQueryBuilder('deal')
      .select('SUM(deal.amount)', 'total')
      .where('deal.organizationId = :organizationId', { organizationId })
      .getRawOne();

    const tasksByStatus = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.organizationId = :organizationId', { organizationId })
      .groupBy('task.status')
      .getRawMany();

    const tasksByPriority = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('task.organizationId = :organizationId', { organizationId })
      .groupBy('task.priority')
      .getRawMany();

    const recentCustomers = await this.customerRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentDeals = await this.dealRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentTasks = await this.taskRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      overview: {
        totalCustomers,
        totalDeals,
        totalTasks,
        totalMembers,
        totalDealValue: totalDealValue?.total || 0,
      },
      deals: {
        byStage: dealsByStage,
        recent: recentDeals,
      },
      tasks: {
        byStatus: tasksByStatus,
        byPriority: tasksByPriority,
        recent: recentTasks,
      },
      customers: {
        recent: recentCustomers,
      },
    };
  }
}
