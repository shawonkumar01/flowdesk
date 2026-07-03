import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('notes')
export class Note extends BaseEntity {
  @Column()
  customerId: string;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  content: string;
}
