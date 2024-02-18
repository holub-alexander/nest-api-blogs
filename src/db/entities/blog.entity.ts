import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import PostEntity from './post.entity';
import CommentEntity from './comment.entity';
import UserEntity from './user.entity';

@Entity({ name: 'blogs', synchronize: false })
class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'varchar',
  })
  name: string;

  @Column({
    nullable: false,
    type: 'varchar',
  })
  description: string;

  @Column({
    nullable: false,
    type: 'varchar',
  })
  website_url: string;

  @Column({ type: 'timestamptz', default: new Date() })
  created_at: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_membership: boolean;

  @OneToMany(() => PostEntity, (post) => post.blog, {
    onDelete: 'CASCADE',
  })
  posts: PostEntity[];

  /**
   * Relation to comments
   * */
  @OneToMany(() => CommentEntity, (comment) => comment.blog, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  @ManyToOne(() => UserEntity, (user) => user.blogs, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  static fromPartial(data: DeepPartial<BlogEntity>): BlogEntity {
    return Object.assign(new BlogEntity(), data);
  }
}

export default BlogEntity;
