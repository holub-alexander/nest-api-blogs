import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
// import UserEntity from './user.entity';
import PostEntity from './post.entity';
// import BlogEntity from './blog.entity';

@Entity({ name: 'banned_users_in_blogs' })
class BannedUserInBlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => PostEntity, (post) => post.blog, {
    onDelete: 'CASCADE',
  })
  posts: PostEntity[];

  /**
   * Relation to blogs
   * */
  // @ManyToOne(() => BlogEntity, (blog) => blog.bannedUsers)
  // @JoinColumn({ name: 'blog_id' })
  // blog: BlogEntity;

  @Column()
  blog_id: number;

  /**
   * Relation to users
   * */
  // @ManyToOne(() => UserEntity, (user) => user.bannedUsers)
  // @JoinColumn({ name: 'user_id' })
  // user: UserEntity;

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
