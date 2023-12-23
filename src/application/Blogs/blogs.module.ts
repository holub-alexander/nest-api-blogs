import { Module } from '@nestjs/common';
import { FindAllBlogsHandler } from './handlers/find-all-blogs.handler';
import { FindOneBlogHandler } from './handlers/find-one-blog.handler';
import { CreateBlogHandler } from './handlers/create-blog.handler';
import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { BlogsWriteRepository } from './repositories/blogs.write.repository';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '../../db/entities/user.entity';
import BlogEntity from '../../db/entities/blog.entity';
import { PublicBlogsController } from '../Public/controllers/public-blogs.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { SuperAdminBlogsController } from '../Super-Admin/controllers/super-admin-blogs.controller';

export const CommandHandlers = [FindAllBlogsHandler, FindOneBlogHandler, CreateBlogHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserEntity, BlogEntity]),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '10m' },
    }),
  ],
  providers: [BlogsQueryRepository, BlogsWriteRepository, UsersQueryRepository, ...CommandHandlers],
  controllers: [PublicBlogsController, SuperAdminBlogsController],
})
export class BlogsModule {}
