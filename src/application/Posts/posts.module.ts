import { Module } from '@nestjs/common';
import { PostsWriteRepository } from './repositories/mongoose/posts.write.repository';
import { PostsQueryRepository } from './repositories/mongoose/posts.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostEntity } from '../../db/entities/mongoose/post.entity';
import { Comment, CommentEntity } from '../../db/entities/mongoose/comment.entity';
import { Reaction, ReactionEntity } from '../../db/entities/mongoose/reaction.entity';
import { BlogsQueryRepository } from '../Blogs/repositories/mongoose/blogs.query.repository';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { UsersQueryRepository } from '../Users/repositories/mongoose/users.query.repository';
import { CommentsQueryRepository } from '../Comments/repositories/mongoose/comments.query.repository';
import { CommentsWriteRepository } from '../Comments/repositories/mongoose/comments.write.repository';
import { ReactionsQueryRepository } from '../Reactions/repositories/mongoose/reactions.query.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/mongoose/reactions.write.repository';
import { User, UserEntity } from '../../db/entities/mongoose/user.entity';
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
import { BanUserQueryRepository } from '../BanUser/repositories/mongoose/ban-user.query.repository';
import { BanUser, BanUserEntity } from '../../db/entities/mongoose/ban-user.entity';
import { PostsTypeOrmQueryRepository } from './repositories/typeorm/posts.query.repository';
import { ReactionsTypeOrmQueryRepository } from '../Reactions/repositories/typeorm/reactions.query.repository';
import { BlogsTypeOrmQueryRepository } from '../Blogs/repositories/typeorm/blogs.query.repository';
import { PostsTypeOrmWriteRepository } from './repositories/typeorm/posts.write.repository';
import { UsersTypeOrmQueryRepository } from '../Users/repositories/typeorm/users.query.repository';
import { CommentsTypeOrmQueryRepository } from '../Comments/repositories/typeorm/comments.query.repository';
import { CommentsTypeOrmWriteRepository } from '../Comments/repositories/typeorm/comments.write.repository';
import { ReactionsTypeOrmWriteRepository } from '../Reactions/repositories/typeorm/reactions.write.repository';
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
    PostsTypeOrmQueryRepository,
    PostsWriteRepository,
    PostsTypeOrmWriteRepository,
    CommentsQueryRepository,
    CommentsWriteRepository,
    ReactionsQueryRepository,
    ReactionsTypeOrmQueryRepository,
    ReactionsWriteRepository,
    BlogsQueryRepository,
    BlogsTypeOrmQueryRepository,
    UsersQueryRepository,
    UsersTypeOrmQueryRepository,
    BanUserQueryRepository,
    CommentsTypeOrmQueryRepository,
    CommentsTypeOrmWriteRepository,
    ReactionsTypeOrmQueryRepository,
    ReactionsTypeOrmWriteRepository,
    BanUserTypeOrmQueryRepository,
    ...CommandHandler,
  ],
})
export class PostsModule {}
