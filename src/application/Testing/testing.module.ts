import { Module } from '@nestjs/common';
import { BlogsWriteRepository } from '../Blogs/repositories/mongoose/blogs.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/mongoose/posts.write.repository';
import { UsersWriteRepository } from '../Users/repositories/mongoose/users.write.repository';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { DeleteAllHandler } from './handlers/delete-all.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../Users/repositories/mongoose/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenEntity, RefreshTokensMeta, User, UserEntity } from '../../db/entities/mongoose/user.entity';
import { Reaction, ReactionEntity } from '../../db/entities/mongoose/reaction.entity';
import { CommentEntity, Comment } from '../../db/entities/mongoose/comment.entity';
import { Post, PostEntity } from '../../db/entities/mongoose/post.entity';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { UsersTypeOrmWriteRepository } from '../Users/repositories/typeorm/users.write.repository';
import { SecurityDevicesTypeOrmWriteRepository } from '../Security-Devices/repositories/typeorm/security-devices.write.repository';

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
    UsersTypeOrmWriteRepository,
    SecurityDevicesTypeOrmWriteRepository,
    ...CommandHandlers,
  ],
})
export class TestingModule {}
