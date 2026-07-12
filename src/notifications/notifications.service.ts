import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
    organizationId: string,
    userId: string,
  ): Promise<Notification> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const { type, ...rest } = createNotificationDto;
    const notification = this.notificationRepository.create({
      ...rest,
      organizationId,
      userId,
      type: type as any,
    });

    return this.notificationRepository.save(notification);
  }

  async findAll(organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    return this.notificationRepository.find({
      where: { organizationId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const notification = await this.notificationRepository.findOne({
      where: { id, organizationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationRepository.update(id, { isRead: true });

    return this.notificationRepository.findOne({ where: { id } });
  }

  async markAllAsRead(organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    await this.notificationRepository.update(
      { organizationId, userId, isRead: false },
      { isRead: true },
    );

    return { message: 'All notifications marked as read' };
  }
}
