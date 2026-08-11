import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'puc_sequences' })
export class PucSequenceEntity {
  @PrimaryColumn({ type: 'varchar', length: 10, name: 'province_code' })
  provinceCode: string;

  @PrimaryColumn({ type: 'int' })
  year: number;

  @Column({ type: 'int', name: 'last_value', default: 0 })
  lastValue: number;
}
