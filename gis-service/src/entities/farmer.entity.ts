import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'farmers' })
export class FarmerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true, name: 'farmer_code' })
  farmerCode: string;

  @Column({ type: 'varchar', length: 120, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 150, name: 'cooperative_name', nullable: true })
  cooperativeName: string | null;

  @Column({ type: 'text', name: 'address_text', nullable: true })
  addressText: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
