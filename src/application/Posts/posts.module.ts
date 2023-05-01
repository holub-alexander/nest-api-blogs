import { Module } from '@nestjs/common';
import { PostsWriteRepository } from './repositories/posts.write.repository';
import { PostsQueryRepository } from './repositories/posts.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostEntity } from '../../entity/post.entity';
import { Comment, CommentEntity } from '../../entity/comment.entity';
import { Reaction, ReactionEntity } from '../../entity/reaction.entity';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { Blog, BlogEntity } from '../../entity/blog.entity';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { CommentsQueryRepository } from '../Comments/repositories/comments.query.repository';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';
import { ReactionsQueryRepository } from '../Reactions/repositories/reactions.query.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { User, UserEntity } from '../../entity/user.entity';
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
import { BanUserQueryRepository } from '../BanUser/repositories/ban-user.query.repository';
import { BanUser, BanUserEntity } from '../../entity/ban-user.entity';

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
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: User.name, schema: UserEntity },
      { name: Comment.name, schema: CommentEntity },
      { name: Reaction.name, schema: ReactionEntity },
      { name: BanUser.name, schema: BanUserEntity },
    ]),
  ],
  controllers: [],
  providers: [
    IsBlogFound,
    PostsQueryRepository,
    PostsWriteRepository,
    CommentsQueryRepository,
    CommentsWriteRepository,
    ReactionsQueryRepository,
    ReactionsWriteRepository,
    BlogsQueryRepository,
    UsersQueryRepository,
    BanUserQueryRepository,
    ...CommandHandler,
  ],
})
export class PostsModule {}
