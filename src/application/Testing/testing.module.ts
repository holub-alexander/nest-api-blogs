import { Module } from '@nestjs/common';
import { DeleteAllHandler } from './handlers/delete-all.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenEntity, RefreshTokensMeta, User, UserEntity } from '../../db/entities/mongoose/user.entity';
import { Reaction, ReactionEntity } from '../../db/entities/mongoose/reaction.entity';
import { CommentEntity, Comment } from '../../db/entities/mongoose/comment.entity';
import { Post, PostEntity } from '../../db/entities/mongoose/post.entity';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { UsersWriteRepository } from '../Users/repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/security-devices.write.repository';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/posts.write.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { BanUserTypeOrmWriteRepository } from '../BanUser/repositories/typeorm/ban-user.write.repository';

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
    ReactionsWriteRepository,
    BanUserTypeOrmWriteRepository,
    UsersWriteRepository,
    SecurityDevicesWriteRepository,
    ...CommandHandlers,
  ],
})
export class TestingModule {}
