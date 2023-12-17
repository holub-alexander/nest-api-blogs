import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import ReactionEntity from './reaction.entity';
import { LikeStatuses } from '../../../common/interfaces';
import UserEntity from './user.entity';
import BlogEntity from './blog.entity';
import PostEntity from './post.entity';

@Entity({ name: 'comments' })
class CommentEntity {
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

  user_login: string;

  @OneToMany(() => ReactionEntity, (reaction) => reaction.comment, { eager: true })
  reactions: ReactionEntity[];

  likes_count: number;

  dislikes_count: number;

  like_status: LikeStatuses;

  /**
   * Relation to user
   * */
  @ManyToOne(() => UserEntity, (user) => user.comments, { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  /**
   * Relation to blog
   * */
  @ManyToOne(() => BlogEntity, (blog) => blog.comments, { eager: true })
  @JoinColumn({ name: 'blog_id', referencedColumnName: 'id' })
  blog: BlogEntity;

  /**
   * Relation to post
   * */
  @ManyToOne(() => PostEntity, (post) => post.comments, { eager: true })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: PostEntity;

  static fromPartial(data: DeepPartial<CommentEntity>): CommentEntity {
    return Object.assign(new CommentEntity(), data);
  }
}

export default CommentEntity;
