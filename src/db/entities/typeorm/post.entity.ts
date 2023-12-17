import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import BlogEntity from './blog.entity';
import ReactionEntity from './reaction.entity';
import CommentEntity from './comment.entity';

@Entity({ name: 'posts' })
class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 30,
  })
  title: string;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 100,
  })
  short_description: string;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 1000,
  })
  content: string;

  @Column()
  blog_id: number;

  blog_name: string;

  @ManyToOne(() => BlogEntity, (blog) => blog.posts, { eager: true })
  @JoinColumn({ name: 'blog_id', referencedColumnName: 'id' })
  blog: BlogEntity;

  @Column({ nullable: false, type: 'timestamptz', default: new Date() })
  created_at: Date;

  dislikes_count: number;

  likes_count: number;

  @OneToMany(() => ReactionEntity, (reaction) => reaction.post)
  reactions: ReactionEntity[];

  /**
   * Relation to comments
   * */
  @OneToMany(() => CommentEntity, (comment) => comment.post, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  static fromPartial(data: DeepPartial<PostEntity>): PostEntity {
    return Object.assign(new PostEntity(), data);
  }
}

export default PostEntity;
