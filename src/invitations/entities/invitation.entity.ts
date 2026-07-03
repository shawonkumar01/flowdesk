import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

import { OrganizationRole } from '../../organization/entities/organization-member.entity';

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

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
