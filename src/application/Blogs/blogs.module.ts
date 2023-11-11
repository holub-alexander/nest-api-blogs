import { Module } from '@nestjs/common';
import { FindAllBlogsHandler } from './handlers/find-all-blogs.handler';
import { FindOneBlogHandler } from './handlers/find-one-blog.handler';
import { CreateBlogHandler } from './handlers/create-blog.handler';
import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { BlogsWriteRepository } from './repositories/blogs.write.repository';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '../../db/entities/typeorm/user.entity';

export const CommandHandlers = [FindAllBlogsHandler, FindOneBlogHandler, CreateBlogHandler];

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [BlogsQueryRepository, BlogsWriteRepository, UsersQueryRepository, ...CommandHandlers],
})
export class BlogsModule {}
