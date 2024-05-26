import {
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import PostEntity from './post.entity';
import CommentEntity from './comment.entity';
import UserEntity from './user.entity';
import BannedUserInBlogEntity from './banned-user-in-blog.entity';
import BlogWallpapersEntity from './blog-wallpapers.entity';
import BlogMainImagesEntity from './blog-main-images.entity';
import PostMainImagesEntity from './post-main-images.entity';

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

  /**
   * Relation to posts
   * */
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

  /**
   * Relation to users
   * */
  @ManyToOne(() => UserEntity, (user) => user.blogs, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  /**
   * Relation to banned users
   * */
  @OneToMany(() => BannedUserInBlogEntity, (bannerUser) => bannerUser.blog, {
    onDelete: 'CASCADE',
  })
  bannedUsers: BannedUserInBlogEntity[];

  /**
   * Relation to wallpapers
   * */
  @OneToOne(() => BlogWallpapersEntity, (blogWallpaper) => blogWallpaper.blog, {
    onDelete: 'CASCADE',
    eager: true,
  })
  blog_wallpaper: BlogWallpapersEntity;

  /**
   * Relation to blog main images
   * */
  @OneToMany(() => BlogMainImagesEntity, (blogMainImages) => blogMainImages.blog, {
    onDelete: 'CASCADE',
    eager: true,
  })
  blog_main_images: BlogMainImagesEntity[];

  /**
   * Relation to post main images
   * */
  @OneToMany(() => PostMainImagesEntity, (postMainImages) => postMainImages.blog, {
    onDelete: 'CASCADE',
  })
  post_main_images: PostMainImagesEntity[];

  @Column({ type: 'timestamptz', default: null })
  ban_date: Date | null;

  @Column({ type: 'boolean', default: false })
  is_banned: boolean;

  static fromPartial(data: DeepPartial<BlogEntity>): BlogEntity {
    return Object.assign(new BlogEntity(), data);
  }
}

export default BlogEntity;
