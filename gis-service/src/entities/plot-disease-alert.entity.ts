import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AlertStatus } from '../common/enums';

@Entity({ name: 'plot_disease_alerts' })
export class PlotDiseaseAlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  puc: string;

  @Column({ type: 'varchar', length: 100, name: 'disease_name' })
  diseaseName: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  confidence: number;

  @Column({ type: 'text', name: 'xai_overlay_url', nullable: true })
  xaiOverlayUrl: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'alert_date' })
  alertDate: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: AlertStatus.MOI_PHAT_HIEN,
  })
  status: AlertStatus;
}
