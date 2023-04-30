import { Module } from '@nestjs/common';
import { BloggerController } from './controllers/bloggger-blogs.controller';
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
import { FindAllBloggerCommentsHandler } from './handlers/find-all-blogger-comments.handler';
import { CommentsQueryRepository } from '../Comments/repositories/comments.query.repository';
import { CommentEntity, Comment } from '../../entity/comment.entity';

export const CommandHandlers = [FindAllBlogsBloggerHandler, FindAllBloggerCommentsHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: User.name, schema: UserEntity },
      { name: Comment.name, schema: CommentEntity },
    ]),
  ],
  controllers: [BloggerController],
  providers: [
    BlogsWriteRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    UsersQueryRepository,
    CommentsQueryRepository,
    ...CommandHandlers,
  ],
})
export class BloggerModule {}
