import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GrowthStatus, RiskLevel } from '../common/enums';

@Entity({ name: 'plots' })
export class PlotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  puc: string;

  @Column({ type: 'uuid', name: 'farmer_id' })
  farmerId: string;

  @Column({ type: 'varchar', length: 100, name: 'plot_name' })
  plotName: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  boundary: object;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'area_m2' })
  areaM2: number;

  @Column({ type: 'varchar', length: 255, name: 'crop_type' })
  cropType: string;

  @Column({ type: 'varchar', length: 20, name: 'cropping_pattern', default: 'DON_CAY' })
  croppingPattern: string;

  @Column({ type: 'text', name: 'crop_types', nullable: true })
  cropTypes: string | null;

  @Column({ type: 'varchar', length: 30, name: 'farmer_code', nullable: true })
  farmerCode: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'growth_status',
    default: GrowthStatus.DANG_TRONG,
  })
  growthStatus: GrowthStatus;

  @Column({ type: 'int', name: 'risk_level', default: RiskLevel.BINH_THUONG })
  riskLevel: RiskLevel;

  @Column({ type: 'text', name: 'qr_code_url', nullable: true })
  qrCodeUrl: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
