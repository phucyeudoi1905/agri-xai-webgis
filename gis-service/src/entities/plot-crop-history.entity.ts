import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'plot_crop_history' })
export class PlotCropHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  puc: string;

  @Column({ type: 'varchar', length: 100, name: 'season_name' })
  seasonName: string;

  @Column({ type: 'varchar', length: 100, name: 'crop_type' })
  cropType: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'yield_amount',
    nullable: true,
  })
  yieldAmount: number | null;

  @Column({ type: 'varchar', length: 30, name: 'yield_unit', nullable: true })
  yieldUnit: string | null;

  @Column({ type: 'text', name: 'soil_condition_note', nullable: true })
  soilConditionNote: string | null;

  @Column({ type: 'text', name: 'disease_history', nullable: true })
  diseaseHistory: string | null;

  @Column({ type: 'boolean', name: 'is_current', default: false })
  isCurrent: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
