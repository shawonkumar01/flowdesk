import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  customerId?: string;

  @Column({ nullable: true })
  dealId?: string;

  @Column({ nullable: true })
  taskId?: string;

  @Column({ default: false })
  isRead: boolean;
}
