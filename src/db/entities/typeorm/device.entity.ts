import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import UserEntityTypeOrm from './user.entity';

@Entity({ name: 'devices' })
class DeviceEntityTypeOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  ip: string;

  @Column({ type: 'varchar', default: null })
  title: string | null;

  @Column({ type: 'varchar', nullable: false })
  device_id: string;

  @Column({ type: 'timestamptz', nullable: false })
  issued_at: string;

  @Column({ type: 'timestamptz', nullable: false })
  expiration_date: string;

  @ManyToOne(() => UserEntityTypeOrm, (user) => user.refresh_tokens_meta)
  @JoinColumn({ name: 'user_id' })
  user: UserEntityTypeOrm;
}

export default DeviceEntityTypeOrm;
