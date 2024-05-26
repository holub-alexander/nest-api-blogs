import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import BlogEntity from './blog.entity';

@Entity({ name: 'blog_main_images' })
class BlogMainImagesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  blog_id: number;

  @Column({ type: 'int', nullable: false })
  width: number;

  @Column({ type: 'int', nullable: false })
  height: number;

  @Column({ type: 'int', nullable: false })
  file_size_in_bytes: number;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  file_name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  file_path: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  bucket_name: string;

  @Column({ type: 'timestamptz', default: new Date(), nullable: false })
  created_at: Date;

  @Column({ type: 'timestamptz', default: null, nullable: true })
  updated_at: Date;

  /**
   * Relation to blog
   * */
  @ManyToOne(() => BlogEntity, (blog) => blog.blog_main_images)
  @JoinColumn({ name: 'blog_id', referencedColumnName: 'id' })
  blog: BlogEntity;
}

export default BlogMainImagesEntity;
