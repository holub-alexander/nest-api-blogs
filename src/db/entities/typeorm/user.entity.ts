import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import DeviceEntityTypeOrm from './device.entity';
import BlogEntityTypeOrm from './blog.entity';
import PostEntityTypeOrm from './post.entity';

@Entity({ name: 'users' })
class UserEntityTypeOrm {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Account data
   */
  @Column({ type: 'varchar', length: 300, nullable: false })
  login: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  email: string;

  @Column({ type: 'timestamptz', nullable: false })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_banned: boolean;

  @Column({ type: 'varchar', length: 1000, default: null })
  ban_reason: string | null;

  @Column({ type: 'timestamptz', default: null })
  ban_date: string | null;

  /**
   * EmailConfirmation
   * */
  @Column({ type: 'varchar', length: 1000, default: null })
  confirmation_code: string | null;

  @Column({ type: 'timestamptz', default: null })
  expiration_date: Date | null;

  @Column({ type: 'boolean', default: false })
  is_confirmed: boolean;

  /**
   * Recovery code
   * */
  @Column({ type: 'varchar', default: null })
  recovery_code: string | null;

  /**
   * RefreshTokensMeta
   * */
  @OneToMany(() => DeviceEntityTypeOrm, (device) => device.user, {
    onDelete: 'CASCADE',
  })
  refresh_tokens_meta: DeviceEntityTypeOrm[];

  /**
   * Relation to blogs
   * */
  @OneToMany(() => BlogEntityTypeOrm, (blog) => blog.user, {
    onDelete: 'CASCADE',
  })
  blogs: BlogEntityTypeOrm[];

  /**
   * Relation to posts
   * */
  @OneToMany(() => PostEntityTypeOrm, (post) => post.user, {
    onDelete: 'CASCADE',
  })
  posts: PostEntityTypeOrm[];
}

export default UserEntityTypeOrm;
