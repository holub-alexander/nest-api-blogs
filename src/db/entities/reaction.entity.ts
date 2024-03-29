import { LikeStatuses } from '../../common/interfaces';
import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import UserEntity from './user.entity';
import PostEntity from './post.entity';
import CommentEntity from './comment.entity';

export type ReactionType = 'comment' | 'post';

@Entity({ name: 'reactions' })
class ReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['comment', 'post'],
    default: 'comment',
  })
  type: ReactionType;

  @ManyToOne(() => CommentEntity, (comment) => comment.reactions)
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'id' })
  comment: CommentEntity;

  @Column({ type: 'int', nullable: true })
  comment_id: number | null;

  @ManyToOne(() => PostEntity, (post) => post.reactions)
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @Column({ type: 'int', nullable: true })
  post_id: number | null;

  @ManyToOne(() => UserEntity, (user) => user.reactions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  user_login: string;

  @Column({ type: 'timestamptz', default: new Date() })
  created_at: Date;

  @Column({ type: 'enum', enum: LikeStatuses, nullable: false, default: LikeStatuses.NONE })
  like_status: LikeStatuses;

  static fromPartial(data: DeepPartial<ReactionEntity>): ReactionEntity {
    return Object.assign(new ReactionEntity(), data);
  }
}

export default ReactionEntity;
