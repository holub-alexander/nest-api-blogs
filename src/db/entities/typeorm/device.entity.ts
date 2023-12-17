import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import UserEntity from './user.entity';

@Entity({ name: 'devices' })
class DeviceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  ip: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  device_id: string;

  @Column({ type: 'timestamptz', nullable: false })
  issued_at: Date;

  @Column({ type: 'timestamptz', nullable: false })
  expiration_date: Date;

  @ManyToOne(() => UserEntity, (user) => user.refresh_tokens_meta)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  static fromPartial(data: DeepPartial<DeviceEntity>): DeviceEntity {
    return Object.assign(new DeviceEntity(), data);
  }
}

export default DeviceEntity;
