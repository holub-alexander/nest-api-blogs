import { Module } from '@nestjs/common';
import { BloggerController } from './bloggger.controller';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from '../../entity/blog.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { PostsQueryRepository } from '../Posts/repositories/posts.query.repository';
import { PostEntity, Post } from '../../entity/post.entity';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { User, UserEntity } from '../../entity/user.entity';
import { FindAllBlogsBloggerHandler } from './handlers/find-all-blogs.handler';

export const CommandHandlers = [FindAllBlogsBloggerHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: User.name, schema: UserEntity },
    ]),
  ],
  controllers: [BloggerController],
  providers: [
    BlogsWriteRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    UsersQueryRepository,
    ...CommandHandlers,
  ],
})
export class BloggerModule {}
