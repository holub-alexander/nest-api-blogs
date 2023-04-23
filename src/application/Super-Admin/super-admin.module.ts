import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsModule } from '../Blogs/blogs.module';
import { SuperAdminBlogsController } from './controllers/super-admin-blogs.controller';
import { SuperAdminUsersController } from './controllers/super-admin-users.controller';
import { UsersModule } from '../Users/users.module';

@Module({
  imports: [CqrsModule, BlogsModule, UsersModule],
  controllers: [SuperAdminBlogsController, SuperAdminUsersController],
  providers: [],
})
export class SuperAdminModule {}
