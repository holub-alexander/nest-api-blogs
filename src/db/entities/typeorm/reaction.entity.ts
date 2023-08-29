import { LikeStatuses } from '../../../common/interfaces';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import UserEntityTypeOrm from './user.entity';
import PostEntityTypeOrm from './post.entity';
import CommentEntityTypeOrm from './comment.entity';

export type ReactionType = 'comment' | 'post';

@Entity({ name: 'reactions' })
class ReactionEntityTypeOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['comment', 'post'],
    default: 'comment',
  })
  type: ReactionType;

  @ManyToOne(() => CommentEntityTypeOrm, (comment) => comment.reactions)
  @JoinColumn({ name: 'comment_id' })
  comment: CommentEntityTypeOrm;

  comment_id: number;

  @ManyToOne(() => PostEntityTypeOrm, (post) => post.reactions)
  @JoinColumn({ name: 'post_id' })
  post: PostEntityTypeOrm;

  post_id: number;

  @ManyToOne(() => UserEntityTypeOrm, (user) => user.reactions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntityTypeOrm;

  user_id: number;

  user_login: string;

  @Column({ type: 'timestamptz', default: new Date() })
  created_at: Date;

  @Column({ type: 'enum', enum: LikeStatuses, nullable: false, default: LikeStatuses.NONE })
  like_status: LikeStatuses;
}

export default ReactionEntityTypeOrm;
