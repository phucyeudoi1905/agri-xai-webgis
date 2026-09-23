import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'app_users' })
export class AppUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20 })
  role: 'ADMIN' | 'HTX_FARMER';

  @Column({ type: 'varchar', length: 120, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 150, name: 'cooperative_name', nullable: true })
  cooperativeName: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
