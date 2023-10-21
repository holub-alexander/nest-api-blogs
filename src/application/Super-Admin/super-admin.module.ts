import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SuperAdminBlogsController } from './controllers/super-admin-blogs.controller';
import { FindAllBlogsSuperAdminHandler } from './handlers/find-all-blogs.handler';
import { BlogsQueryRepository } from '../Blogs/repositories/mongoose/blogs.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { BanUnbanBlogSuperAdminHandler } from './handlers/ban-unban-blog.handler';
import { Post, PostEntity } from '../../db/entities/mongoose/post.entity';
import { Comment, CommentEntity } from '../../db/entities/mongoose/comment.entity';
import { BlogsWriteRepository } from '../Blogs/repositories/mongoose/blogs.write.repository';
import { BlogsTypeOrmQueryRepository } from '../Blogs/repositories/typeorm/blogs.query.repository';
import { BlogsTypeOrmWriteRepository } from '../Blogs/repositories/typeorm/blogs.write.repository';
import { CreateBlogSuperAdminHandler } from './handlers/create-blog-super-admin.handler';
import { BanUserModule } from '../BanUser/ban-user.module';
import { User, UserEntity } from '../../db/entities/mongoose/user.entity';
import { Reaction, ReactionEntity } from '../../db/entities/mongoose/reaction.entity';
import { BanUser, BanUserEntity } from '../../db/entities/mongoose/ban-user.entity';
import { PostsQueryRepository } from '../Posts/repositories/mongoose/posts.query.repository';
import { PostsTypeOrmQueryRepository } from '../Posts/repositories/typeorm/posts.query.repository';
import { UsersQueryRepository } from '../Users/repositories/mongoose/users.query.repository';
import { UsersTypeOrmQueryRepository } from '../Users/repositories/typeorm/users.query.repository';
import { UsersTypeOrmWriteRepository } from '../Users/repositories/typeorm/users.write.repository';
import { CommentsQueryRepository } from '../Comments/repositories/mongoose/comments.query.repository';
import { BanUserWriteRepository } from '../BanUser/repositories/mongoose/ban-user.write.repository';
import { BanUserTypeOrmWriteRepository } from '../BanUser/repositories/typeorm/ban-user.write.repository';
import { BanUserTypeOrmQueryRepository } from '../BanUser/repositories/typeorm/ban-user.query.repository';
import { BanUserQueryRepository } from '../BanUser/repositories/mongoose/ban-user.query.repository';
import { ReactionsQueryRepository } from '../Reactions/repositories/mongoose/reactions.query.repository';
import { SuperAdminUsersController } from './controllers/super-admin-users.controller';
import { UsersModule } from '../Users/users.module';

export const CommandHandlers = [
  FindAllBlogsSuperAdminHandler,
  BanUnbanBlogSuperAdminHandler,
  CreateBlogSuperAdminHandler,
];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    BanUserModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: User.name, schema: UserEntity },
      { name: Reaction.name, schema: ReactionEntity },
      { name: Comment.name, schema: CommentEntity },
      { name: BanUser.name, schema: BanUserEntity },
    ]),
  ],
  controllers: [SuperAdminBlogsController, SuperAdminUsersController],
  providers: [
    BlogsWriteRepository,
    BlogsTypeOrmWriteRepository,
    BlogsQueryRepository,
    BlogsTypeOrmQueryRepository,
    PostsQueryRepository,
    PostsTypeOrmQueryRepository,
    UsersQueryRepository,
    UsersTypeOrmQueryRepository,
    UsersTypeOrmWriteRepository,
    CommentsQueryRepository,
    BanUserWriteRepository,
    BanUserTypeOrmWriteRepository,
    BanUserTypeOrmQueryRepository,
    BanUserQueryRepository,
    ReactionsQueryRepository,
    ...CommandHandlers,
  ],
})
export class SuperAdminModule {}
