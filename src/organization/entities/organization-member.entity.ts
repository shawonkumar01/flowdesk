import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Organization } from './organization.entity';
import { User } from '../../users/entities/user.entity';

export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
  SUPPORT = 'SUPPORT',
}

@Entity('organization_members')
export class OrganizationMember extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
  })
  role: OrganizationRole;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
