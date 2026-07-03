import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum DealStage {
  LEAD = 'LEAD',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

@Entity('deals')
export class Deal extends BaseEntity {
  @Column()
  customerId: string;

  @Column()
  organizationId: string;

  @Column()
  title: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: DealStage,
    default: DealStage.LEAD,
  })
  stage: DealStage;

  @Column({ nullable: true, type: 'date' })
  expectedCloseDate: Date;

  @Column({ nullable: true })
  assignedTo: string;
}
