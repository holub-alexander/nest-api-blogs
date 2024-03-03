import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import BlogEntity from './blog.entity';
import UserEntity from './user.entity';

@Entity({ name: 'banned_users_in_blogs' })
class BannedUserInBlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Relation to blogs
   * */
  @ManyToOne(() => BlogEntity, (blog) => blog.bannedUsers)
  @JoinColumn({ name: 'blog_id', referencedColumnName: 'id' })
  blog: BlogEntity;

  /**
   * Relation to users
   * */
  @ManyToOne(() => UserEntity, (user) => user.bannedUsers)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @Column({ type: 'boolean', nullable: false })
  is_banned: boolean;

  @Column({ type: 'varchar', nullable: false })
  ban_reason: string;

  @Column({ type: 'timestamptz', nullable: false, default: new Date() })
  created_at: Date;
}

export default BannedUserInBlogEntity;
