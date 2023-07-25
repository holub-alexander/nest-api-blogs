import { Module } from '@nestjs/common';
import { BloggerBlogsController } from './controllers/bloggger-blogs.controller';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { PostsQueryRepository } from '../Posts/repositories/posts.query.repository';
import { PostEntity, Post } from '../../db/entities/mongoose/post.entity';
import { UsersQueryRepository } from '../Users/repositories/mongoose/users.query.repository';
import { User, UserEntity } from '../../db/entities/mongoose/user.entity';
import { FindAllBlogsBloggerHandler } from './handlers/find-all-blogs.handler';
import { FindAllBloggerCommentsHandler } from './handlers/find-all-blogger-comments.handler';
import { CommentsQueryRepository } from '../Comments/repositories/comments.query.repository';
import { CommentEntity, Comment } from '../../db/entities/mongoose/comment.entity';
import { BanUserModule } from '../BanUser/ban-user.module';
import { BanUser, BanUserEntity } from '../../db/entities/mongoose/ban-user.entity';
import { BanUnbanUserForBlogHandler } from './handlers/ban-unban-user-for-blog.handler';
import { BanUserWriteRepository } from '../BanUser/repositories/ban-user.write.repository';
import { BloggerUsersController } from './controllers/blogger-users.controller';
import { BanUserQueryRepository } from '../BanUser/repositories/ban-user.query.repository';
import { FindAllBannedUsersForBlogHandler } from './handlers/find-all-banned-users-for-blog.handler';

export const CommandHandlers = [
  FindAllBlogsBloggerHandler,
  FindAllBloggerCommentsHandler,
  BanUnbanUserForBlogHandler,
  FindAllBannedUsersForBlogHandler,
];

@Module({
  imports: [
    CqrsModule,
    BanUserModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: User.name, schema: UserEntity },
      { name: Comment.name, schema: CommentEntity },
      { name: BanUser.name, schema: BanUserEntity },
    ]),
  ],
  controllers: [BloggerBlogsController, BloggerUsersController],
  providers: [
    BlogsWriteRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    UsersQueryRepository,
    CommentsQueryRepository,
    BanUserWriteRepository,
    BanUserQueryRepository,
    ...CommandHandlers,
  ],
})
export class BloggerModule {}
