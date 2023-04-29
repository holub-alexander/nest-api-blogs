import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsModule } from '../Blogs/blogs.module';
import { SuperAdminBlogsController } from './controllers/super-admin-blogs.controller';
import { SuperAdminUsersController } from './controllers/super-admin-users.controller';
import { UsersModule } from '../Users/users.module';
import { FindAllBlogsSuperAdminHandler } from './handlers/find-all-blogs.handler';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from '../../entity/blog.entity';

export const CommandHandlers = [FindAllBlogsSuperAdminHandler];

@Module({
  imports: [CqrsModule, BlogsModule, UsersModule, MongooseModule.forFeature([{ name: Blog.name, schema: BlogEntity }])],
  controllers: [SuperAdminBlogsController, SuperAdminUsersController],
  providers: [BlogsQueryRepository, ...CommandHandlers],
})
export class SuperAdminModule {}
