import { Module } from '@nestjs/common';
import { DeleteAllHandler } from './handlers/delete-all.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersWriteRepository } from '../Users/repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/security-devices.write.repository';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/posts.write.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '../../db/entities/user.entity';
import DeviceEntity from '../../db/entities/device.entity';
import BlogEntity from '../../db/entities/blog.entity';
import PostEntity from '../../db/entities/post.entity';
import ReactionEntity from '../../db/entities/reaction.entity';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';
import CommentEntity from '../../db/entities/comment.entity';

export const CommandHandlers = [DeleteAllHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserEntity, DeviceEntity, BlogEntity, PostEntity, ReactionEntity, CommentEntity]),
  ],
  controllers: [],
  providers: [
    BlogsWriteRepository,
    PostsWriteRepository,
    ReactionsWriteRepository,
    UsersWriteRepository,
    SecurityDevicesWriteRepository,
    CommentsWriteRepository,
    ...CommandHandlers,
  ],
})
export class TestingModule {}
