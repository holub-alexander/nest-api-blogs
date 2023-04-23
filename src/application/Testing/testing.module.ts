import { Module } from '@nestjs/common';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/posts.write.repository';
import { UsersWriteRepository } from '../Users/repositories/users.write.repository';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { DeleteAllHandler } from './handlers/delete-all.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenEntity, RefreshTokensMeta, User, UserEntity } from '../../entity/user.entity';
import { Reaction, ReactionEntity } from '../../entity/reaction.entity';
import { CommentEntity, Comment } from '../../entity/comment.entity';
import { Post, PostEntity } from '../../entity/post.entity';
import { Blog, BlogEntity } from '../../entity/blog.entity';

export const CommandHandlers = [DeleteAllHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: User.name, schema: UserEntity },
      { name: RefreshTokensMeta.name, schema: RefreshTokenEntity },
      { name: Comment.name, schema: CommentEntity },
      { name: Reaction.name, schema: ReactionEntity },
    ]),
  ],
  controllers: [],
  providers: [
    BlogsWriteRepository,
    PostsWriteRepository,
    UsersWriteRepository,
    CommentsWriteRepository,
    ReactionsWriteRepository,
    UsersQueryRepository,
    ...CommandHandlers,
  ],
})
export class TestingModule {}
