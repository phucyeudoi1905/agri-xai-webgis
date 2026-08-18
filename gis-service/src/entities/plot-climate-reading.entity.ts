import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** T24 stub — chuỗi thời gian vi khí hậu gắn theo PUC (IoT). */
@Entity({ name: 'plot_climate_readings' })
export class PlotClimateReadingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'puc', type: 'varchar', length: 50 })
  puc: string;

  @Column({ name: 'temperature_c', type: 'numeric', precision: 5, scale: 2 })
  temperatureC: number;

  @Column({ name: 'humidity_pct', type: 'numeric', precision: 5, scale: 2 })
  humidityPct: number;

  @Column({ name: 'sensor_id', type: 'varchar', length: 64, nullable: true })
  sensorId: string | null;

  @CreateDateColumn({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;
}
