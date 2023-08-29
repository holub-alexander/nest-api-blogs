import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserEntityTypeOrm from './user.entity';
import PostEntityTypeOrm from './post.entity';
import BannedUserInBlogEntity from './banned-user-in-blog.entity';

@Entity({ name: 'blogs' })
class BlogEntityTypeOrm {
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

  @Column()
  user_id: number;

  user_is_banned: boolean;

  user_login: string;

  @ManyToOne(() => UserEntityTypeOrm, (user) => user.blogs)
  @JoinColumn({ name: 'user_id' })
  user: UserEntityTypeOrm;

  @OneToMany(() => PostEntityTypeOrm, (post) => post.blog, {
    onDelete: 'CASCADE',
  })
  posts: PostEntityTypeOrm[];

  @OneToMany(() => BannedUserInBlogEntity, (bannedUser) => bannedUser.blog, {
    onDelete: 'CASCADE',
  })
  bannedUsers: BannedUserInBlogEntity[];

  @Column({ type: 'timestamptz', default: null })
  ban_date: Date | null;

  @Column({ type: 'boolean', default: false })
  is_banned: boolean;
}

export default BlogEntityTypeOrm;
