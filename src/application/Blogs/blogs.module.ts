import { Module } from '@nestjs/common';
import { BlogsQueryRepository } from './repositories/mongoose/blogs.query.repository';
import { BlogsWriteRepository } from './repositories/mongoose/blogs.write.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from '../../db/entities/mongoose/blog.entity';
import { FindAllBlogsHandler } from './handlers/find-all-blogs.handler';
import { FindOneBlogHandler } from './handlers/find-one-blog.handler';
import { CreateBlogHandler } from './handlers/create-blog.handler';
import { UsersQueryRepository } from '../Users/repositories/mongoose/users.query.repository';
import { User, UserEntity } from '../../db/entities/mongoose/user.entity';
import { BlogsTypeOrmQueryRepository } from './repositories/typeorm/blogs.query.repository';
import { BlogsTypeOrmWriteRepository } from './repositories/typeorm/blogs.write.repository';
import { UsersTypeOrmQueryRepository } from '../Users/repositories/typeorm/users.query.repository';

export const CommandHandlers = [FindAllBlogsHandler, FindOneBlogHandler, CreateBlogHandler];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: User.name, schema: UserEntity },
    ]),
  ],
  providers: [
    BlogsQueryRepository,
    BlogsTypeOrmQueryRepository,
    BlogsWriteRepository,
    BlogsTypeOrmWriteRepository,
    UsersQueryRepository,
    UsersTypeOrmQueryRepository,
    ...CommandHandlers,
  ],
})
export class BlogsModule {}
