import { Module } from '@nestjs/common';
import { FindAllPostsByBlogIdHandler } from './handlers/find-all-posts-for-blog.handler';
import { FindPostHandler } from './handlers/find-post.handler';
import { CreatePostHandler } from './handlers/create-post.handler';
import { IsBlogFound } from './dto/create.dto';
import { CqrsModule } from '@nestjs/cqrs';
import { SetLikeUnlikeForPostHandler } from './handlers/set-like-unlike.handler';
import { FindAllPostsHandler } from './handlers/find-all-posts.handler';
import { UpdatePostHandler } from './handlers/update-post.handler';
import { DeleteOnePostHandler } from './handlers/delete-one-post.handler';
import { FindAllCommentsForPostHandler } from './handlers/find-all-comments-for-post.handler';
import { CreateCommentForPostHandler } from './handlers/create-comment-for-post.handler';
import { PostsQueryRepository } from './repositories/posts.query.repository';
import { ReactionsQueryRepository } from '../Reactions/repositories/reactions.query.repository';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { PostsWriteRepository } from './repositories/posts.write.repository';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { CommentsQueryRepository } from '../Comments/repositories/comments.query.repository';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { BanUserTypeOrmQueryRepository } from '../BanUser/repositories/typeorm/ban-user.query.repository';

export const CommandHandler = [
  FindAllPostsHandler,
  FindAllPostsByBlogIdHandler,
  FindPostHandler,
  CreatePostHandler,
  SetLikeUnlikeForPostHandler,
  UpdatePostHandler,
  DeleteOnePostHandler,
  FindAllCommentsForPostHandler,
  CreateCommentForPostHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [
    IsBlogFound,
    PostsQueryRepository,
    PostsWriteRepository,
    ReactionsQueryRepository,
    BlogsQueryRepository,
    UsersQueryRepository,
    CommentsQueryRepository,
    CommentsWriteRepository,
    ReactionsQueryRepository,
    ReactionsWriteRepository,
    BanUserTypeOrmQueryRepository,
    ...CommandHandler,
  ],
})
export class PostsModule {}
