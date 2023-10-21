import { Module } from '@nestjs/common';
import { SuperAdminBlogsController } from '../Super-Admin/controllers/super-admin-blogs.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { FindAllBlogsBloggerHandler } from './handlers/find-all-blogs.handler';
import { FindAllBloggerCommentsHandler } from './handlers/find-all-blogger-comments.handler';
import { BanUserModule } from '../BanUser/ban-user.module';
import { BanUnbanUserForBlogHandler } from './handlers/ban-unban-user-for-blog.handler';
import { BloggerUsersController } from './controllers/blogger-users.controller';
import { FindAllBannedUsersForBlogHandler } from './handlers/find-all-banned-users-for-blog.handler';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { UsersWriteRepository } from '../Users/repositories/users.write.repository';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { PostsQueryRepository } from '../Posts/repositories/posts.query.repository';
import { BanUserTypeOrmWriteRepository } from '../BanUser/repositories/typeorm/ban-user.write.repository';
import { BanUserTypeOrmQueryRepository } from '../BanUser/repositories/typeorm/ban-user.query.repository';

export const CommandHandlers = [
  FindAllBlogsBloggerHandler,
  FindAllBloggerCommentsHandler,
  BanUnbanUserForBlogHandler,
  FindAllBannedUsersForBlogHandler,
];

@Module({
  imports: [CqrsModule, BanUserModule],
  controllers: [SuperAdminBlogsController, BloggerUsersController],
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
export class BloggerModule {}
