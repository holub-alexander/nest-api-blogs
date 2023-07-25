import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SuperAdminBlogsController } from './controllers/super-admin-blogs.controller';
import { SuperAdminUsersController } from './controllers/super-admin-users.controller';
import { FindAllBlogsSuperAdminHandler } from './handlers/find-all-blogs.handler';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { BanUnbanBlogSuperAdminHandler } from './handlers/ban-unban-blog.handler';
import { Post, PostEntity } from '../../db/entities/mongoose/post.entity';
import { Comment, CommentEntity } from '../../db/entities/mongoose/comment.entity';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/posts.write.repository';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';
import { UsersModule } from '../Users/users.module';

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
  ],
  controllers: [SuperAdminBlogsController, SuperAdminUsersController],
  providers: [
    BlogsQueryRepository,
    BlogsWriteRepository,
    PostsWriteRepository,
    CommentsWriteRepository,
    ...CommandHandlers,
  ],
})
export class SuperAdminModule {}
