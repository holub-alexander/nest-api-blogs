import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import ReactionEntity from './reaction.entity';
import { LikeStatuses } from '../../../common/interfaces';

@Entity({ name: 'comments' })
class CommentEntityTypeOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'int', nullable: false })
  blog_id: number;

  @Column({ type: 'int', nullable: false })
  post_id: number;

  @Column({ type: 'timestamptz', default: new Date(), nullable: false })
  created_at: Date;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'varchar' })
  user_login: string;

  @OneToMany(() => ReactionEntity, (reaction) => reaction.comment)
  reactions: ReactionEntity[];

  @Column({ type: 'int' })
  likes_count: number;

  @Column({ type: 'int' })
  dislikes_count: number;

  like_status: LikeStatuses;
}

export default CommentEntityTypeOrm;
