import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import BlogEntityTypeOrm from './blog.entity';
import UserEntityTypeOrm from './user.entity';

@Entity({ name: 'posts' })
class PostEntityTypeOrm {
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

  @ManyToOne(() => BlogEntityTypeOrm, (blog) => blog.posts)
  @JoinColumn({ name: 'blog_id' })
  blog: BlogEntityTypeOrm;

  @Column({ nullable: false, type: 'timestamptz', default: new Date() })
  created_at: Date;

  @Column({ nullable: false, type: 'boolean', default: false })
  is_banned: boolean;

  @Column({ nullable: false, type: 'int', default: 0 })
  likes_count: number;

  @Column({ nullable: false, type: 'int', default: 0 })
  dislikes_count: number;

  @Column()
  user_id: number;

  @ManyToOne(() => UserEntityTypeOrm, (user) => user.blogs)
  @JoinColumn({ name: 'user_id' })
  user: UserEntityTypeOrm;
}

export default PostEntityTypeOrm;
