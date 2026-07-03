import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum ActivityAction {
  CREATE_CUSTOMER = 'CREATE_CUSTOMER',
  UPDATE_CUSTOMER = 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER = 'DELETE_CUSTOMER',
  CREATE_DEAL = 'CREATE_DEAL',
  UPDATE_DEAL = 'UPDATE_DEAL',
  DELETE_DEAL = 'DELETE_DEAL',
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  INVITE_USER = 'INVITE_USER',
  REMOVE_USER = 'REMOVE_USER',
  UPDATE_ROLE = 'UPDATE_ROLE',
}

@Entity('activity_logs')
export class ActivityLog extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp' })
  timestamp: Date;
}
