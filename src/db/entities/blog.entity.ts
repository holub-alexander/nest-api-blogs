import { Column, DeepPartial, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import PostEntity from './post.entity';
import CommentEntity from './comment.entity';

@Entity({ name: 'blogs' })
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

  static fromPartial(data: DeepPartial<BlogEntity>): BlogEntity {
    return Object.assign(new BlogEntity(), data);
  }
}

export default BlogEntity;
