import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SuperAdminBlogsController } from './controllers/super-admin-blogs.controller';
import { FindAllBlogsSuperAdminHandler } from './handlers/find-all-blogs.handler';
import { BanUnbanBlogSuperAdminHandler } from './handlers/ban-unban-blog.handler';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { CreateBlogSuperAdminHandler } from './handlers/create-blog-super-admin.handler';
import { BanUserModule } from '../BanUser/ban-user.module';
import { PostsQueryRepository } from '../Posts/repositories/posts.query.repository';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { UsersWriteRepository } from '../Users/repositories/users.write.repository';
import { BanUserTypeOrmWriteRepository } from '../BanUser/repositories/typeorm/ban-user.write.repository';
import { BanUserTypeOrmQueryRepository } from '../BanUser/repositories/typeorm/ban-user.query.repository';
import { SuperAdminUsersController } from './controllers/super-admin-users.controller';
import { UsersModule } from '../Users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '../../db/entities/typeorm/user.entity';
import BlogEntity from '../../db/entities/typeorm/blog.entity';
import PostEntity from '../../db/entities/typeorm/post.entity';

export const CommandHandlers = [
  FindAllBlogsSuperAdminHandler,
  BanUnbanBlogSuperAdminHandler,
  CreateBlogSuperAdminHandler,
];

@Module({
  imports: [CqrsModule, UsersModule, BanUserModule, TypeOrmModule.forFeature([UserEntity, BlogEntity, PostEntity])],
  controllers: [SuperAdminBlogsController, SuperAdminUsersController],
  providers: [
    BlogsWriteRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    UsersQueryRepository,
    UsersWriteRepository,
    BanUserTypeOrmWriteRepository,
    BanUserTypeOrmQueryRepository,
    ...CommandHandlers,
  ],
})
export class SuperAdminModule {}
