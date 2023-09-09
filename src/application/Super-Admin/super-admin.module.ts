import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SuperAdminBlogsController } from './controllers/super-admin-blogs.controller';
import { SuperAdminUsersController } from './controllers/super-admin-users.controller';
import { FindAllBlogsSuperAdminHandler } from './handlers/find-all-blogs.handler';
import { BlogsQueryRepository } from '../Blogs/repositories/mongoose/blogs.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { BanUnbanBlogSuperAdminHandler } from './handlers/ban-unban-blog.handler';
import { Post, PostEntity } from '../../db/entities/mongoose/post.entity';
import { Comment, CommentEntity } from '../../db/entities/mongoose/comment.entity';
import { BlogsWriteRepository } from '../Blogs/repositories/mongoose/blogs.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/mongoose/posts.write.repository';
import { CommentsWriteRepository } from '../Comments/repositories/mongoose/comments.write.repository';
import { UsersModule } from '../Users/users.module';
import { BlogsTypeOrmQueryRepository } from '../Blogs/repositories/typeorm/blogs.query.repository';
import { getDataSourceToken, getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import BlogEntityTypeOrm from '../../db/entities/typeorm/blog.entity';
import { DataSource } from 'typeorm';
import { BlogsTypeOrmWriteRepository } from '../Blogs/repositories/typeorm/blogs.write.repository';

export const CommandHandlers = [FindAllBlogsSuperAdminHandler, BanUnbanBlogSuperAdminHandler];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: Comment.name, schema: CommentEntity },
    ]),
    TypeOrmModule.forFeature([BlogEntityTypeOrm]),
  ],
  controllers: [SuperAdminBlogsController, SuperAdminUsersController],
  providers: [
    BlogsQueryRepository,
    BlogsTypeOrmQueryRepository,
    BlogsWriteRepository,
    BlogsTypeOrmWriteRepository,
    PostsWriteRepository,
    CommentsWriteRepository,

    // {
    //   provide: getRepositoryToken(BlogEntityTypeOrm),
    //   inject: [getDataSourceToken()],
    //   useFactory(datasource: DataSource) {
    //     return datasource.getRepository(BlogEntityTypeOrm).extend(BlogsTypeOrmQueryRepository);
    //   },
    // },

    ...CommandHandlers,
  ],
})
export class SuperAdminModule {}
