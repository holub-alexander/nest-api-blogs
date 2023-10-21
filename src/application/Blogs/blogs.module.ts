import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { FindAllBlogsHandler } from './handlers/find-all-blogs.handler';
import { FindOneBlogHandler } from './handlers/find-one-blog.handler';
import { CreateBlogHandler } from './handlers/create-blog.handler';
import { User, UserEntity } from '../../db/entities/mongoose/user.entity';
import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { BlogsWriteRepository } from './repositories/blogs.write.repository';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';

export const CommandHandlers = [FindAllBlogsHandler, FindOneBlogHandler, CreateBlogHandler];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: User.name, schema: UserEntity },
    ]),
  ],
  providers: [BlogsQueryRepository, BlogsWriteRepository, UsersQueryRepository, ...CommandHandlers],
})
export class BlogsModule {}
