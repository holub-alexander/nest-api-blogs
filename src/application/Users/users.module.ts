import { Module } from '@nestjs/common';
import { UsersQueryRepository } from './repositories/mongoose/users.query.repository';
import { UsersWriteRepository } from './repositories/mongoose/users.write.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserEntity } from '../../db/entities/mongoose/user.entity';
import { FindAllUsersHandler } from './handlers/find-all-users.handler';
import { CreateUserHandler } from './handlers/create-user.handler';
import { DeleteUserHandler } from './handlers/delete-user.handler';
import { FindOneUserHandler } from './handlers/find-one-user.handler';
import { BanUnbanUserHandler } from './handlers/ban-unban-user.handler';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';
import { CommentEntity, Comment } from '../../db/entities/mongoose/comment.entity';
import { ReactionsWriteRepository } from '../Reactions/repositories/mongoose/reactions.write.repository';
import { Reaction, ReactionEntity } from '../../db/entities/mongoose/reaction.entity';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/mongoose/security-devices.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/mongoose/posts.write.repository';
import { PostEntity, Post } from '../../db/entities/mongoose/post.entity';
import { BlogsWriteRepository } from '../Blogs/repositories/mongoose/blogs.write.repository';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersTypeOrmQueryRepository } from './repositories/typeorm/users.query.repository';
import UserEntityTypeOrm from '../../db/entities/typeorm/user.entity';
import DeviceEntityTypeOrm from '../../db/entities/typeorm/device.entity';
import { UsersTypeOrmWriteRepository } from './repositories/typeorm/users.write.repository';
import { SecurityDevicesTypeOrmWriteRepository } from '../Security-Devices/repositories/typeorm/security-devices.write.repository';

export const CommandHandlers = [
  FindAllUsersHandler,
  CreateUserHandler,
  DeleteUserHandler,
  FindOneUserHandler,
  BanUnbanUserHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserEntity },
      { name: Comment.name, schema: CommentEntity },
      { name: Reaction.name, schema: ReactionEntity },
      { name: Post.name, schema: PostEntity },
      { name: Blog.name, schema: BlogEntity },
    ]),
    TypeOrmModule.forFeature([UserEntityTypeOrm, DeviceEntityTypeOrm]),
  ],
  controllers: [],
  providers: [
    UsersQueryRepository,
    UsersWriteRepository,
    UsersTypeOrmQueryRepository,
    UsersTypeOrmWriteRepository,
    CommentsWriteRepository,
    ReactionsWriteRepository,
    PostsWriteRepository,
    BlogsWriteRepository,
    SecurityDevicesWriteRepository,
    SecurityDevicesTypeOrmWriteRepository,
    ...CommandHandlers,
  ],
})
export class UsersModule {}
