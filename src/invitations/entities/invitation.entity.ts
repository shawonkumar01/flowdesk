import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

import { OrganizationRole } from '../../organization/entities/organization-member.entity';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

@Entity('invitations')
export class Invitation extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
  })
  role: OrganizationRole;

  @Column()
  token: string;

  @Column()
  invitedBy: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;
}
