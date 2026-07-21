import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('customers')
@Index('customer_search_idx', { synchronize: false })
export class Customer extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column()
  createdBy: string;

  @Column({ type: 'tsvector', select: false, nullable: true })
  searchVector: string;
}
