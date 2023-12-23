import { Column, DeepPartial, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import DeviceEntity from './device.entity';
import ReactionEntity from './reaction.entity';
import CommentEntity from './comment.entity';

@Entity({ name: 'users' })
class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Account data
   */
  @Column({ type: 'varchar', length: 300, nullable: false })
  login: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  email: string;

  @Column({ type: 'timestamptz', nullable: false })
  created_at: Date;

  /**
   * EmailConfirmation
   * */
  @Column({ type: 'varchar', length: 1000, default: null })
  confirmation_code: string | null;

  @Column({ type: 'timestamptz', default: null })
  expiration_date: Date | null;

  @Column({ type: 'boolean', default: false })
  is_confirmed: boolean;

  /**
   * Recovery code
   * */
  @Column({ type: 'varchar', default: null })
  recovery_code: string | null;

  /**
   * RefreshTokensMeta
   * */
  @OneToMany(() => DeviceEntity, (device) => device.user, {
    onDelete: 'CASCADE',
  })
  refresh_tokens_meta: DeviceEntity[];

  /**
   * Relation to reactions
   * */
  @OneToMany(() => ReactionEntity, (reaction) => reaction.user, {
    onDelete: 'CASCADE',
  })
  reactions: ReactionEntity[];

  /**
   * Relation to comments
   * */
  @OneToMany(() => CommentEntity, (comment) => comment.user, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  static fromPartial(data: DeepPartial<UserEntity>): UserEntity {
    return Object.assign(new UserEntity(), data);
  }
}

export default UserEntity;
