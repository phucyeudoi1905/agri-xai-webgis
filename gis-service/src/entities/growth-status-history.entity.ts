import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GrowthStatus } from '../common/enums';

@Entity({ name: 'growth_status_history' })
export class GrowthStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  puc: string;

  @Column({ type: 'varchar', length: 20, name: 'from_status', nullable: true })
  fromStatus: GrowthStatus | null;

  @Column({ type: 'varchar', length: 20, name: 'to_status' })
  toStatus: GrowthStatus;

  @Column({ type: 'uuid', name: 'changed_by', nullable: true })
  changedBy: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'changed_at' })
  changedAt: Date;
}
