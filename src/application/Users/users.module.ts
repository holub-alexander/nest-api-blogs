import { Module } from '@nestjs/common';
import { UsersQueryRepository } from './repositories/users.query.repository';
import { UsersWriteRepository } from './repositories/users.write.repository';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserEntity } from '../../entity/user.entity';
import { FindAllUsersHandler } from './handlers/find-all-users.handler';
import { CreateUserHandler } from './handlers/create-user.handler';
import { DeleteUserHandler } from './handlers/delete-user.handler';
import { FindOneUserHandler } from './handlers/find-one-user.handler';
import { BanUnbanUserHandler } from './handlers/ban-unban-user.handler';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';
import { CommentEntity, Comment } from '../../entity/comment.entity';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { Reaction, ReactionEntity } from '../../entity/reaction.entity';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/security-devices.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/posts.write.repository';
import { PostEntity, Post } from '../../entity/post.entity';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { Blog, BlogEntity } from '../../entity/blog.entity';

export const CommandHandlers = [
  FindAllUsersHandler,
  CreateUserHandler,
  DeleteUserHandler,
  FindOneUserHandler,
  BanUnbanUserHandler,
  SecurityDevicesWriteRepository,
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
  ],
  controllers: [],
  providers: [
    UsersQueryRepository,
    UsersWriteRepository,
    CommentsWriteRepository,
    UsersService,
    ReactionsWriteRepository,
    PostsWriteRepository,
    BlogsWriteRepository,
    ...CommandHandlers,
  ],
})
export class UsersModule {}
