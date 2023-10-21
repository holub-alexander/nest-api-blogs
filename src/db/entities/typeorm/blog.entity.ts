import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import PostEntityTypeOrm from './post.entity';

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

  @OneToMany(() => PostEntityTypeOrm, (post) => post.blog, {
    onDelete: 'CASCADE',
  })
  posts: PostEntityTypeOrm[];
}

export default BlogEntityTypeOrm;
