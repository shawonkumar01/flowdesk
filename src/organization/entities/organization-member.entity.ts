import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

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
}
