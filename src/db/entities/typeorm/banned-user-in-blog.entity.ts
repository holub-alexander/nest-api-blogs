import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserEntityTypeOrm from './user.entity';
import PostEntityTypeOrm from './post.entity';
import BlogEntityTypeOrm from './blog.entity';

@Entity({ name: 'banned_users_in_blogs' })
class BannedUserInBlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => PostEntityTypeOrm, (post) => post.blog, {
    onDelete: 'CASCADE',
  })
  posts: PostEntityTypeOrm[];

  /**
   * Relation to blogs
   * */
  @ManyToOne(() => BlogEntityTypeOrm, (blog) => blog.bannedUsers)
  @JoinColumn({ name: 'blog_id' })
  blog: BlogEntityTypeOrm;

  @Column()
  blog_id: number;

  /**
   * Relation to users
   * */
  @ManyToOne(() => UserEntityTypeOrm, (user) => user.bannedUsers)
  @JoinColumn({ name: 'user_id' })
  user: UserEntityTypeOrm;

  @Column()
  user_id: number;

  user_login: string;

  @Column({ type: 'boolean', nullable: false })
  is_banned: boolean;

  @Column({ type: 'varchar', nullable: false })
  ban_reason: string;

  @Column({ type: 'timestamptz', nullable: false, default: new Date() })
  created_at: Date;
}

export default BannedUserInBlogEntity;
