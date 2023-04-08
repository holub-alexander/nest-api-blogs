import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Blog, BlogEntity } from '@/entity/blog.entity';
import { Post, PostEntity } from '@/entity/post.entity';
import { User, UserEntity } from '@/entity/user.entity';
import { BlogsController } from '@/blogs/blogs.controller';
import { PostsController } from '@/posts/posts.controller';
import { UsersController } from '@/users/users.controller';
import { TestingController } from '@/testingtesting.controller';
import { AppController } from './app.controller';
import { BlogsService } from '@/blogs/blogs.service';
import { BlogsQueryRepository } from '@/blogs/repositories/blogs.query.repository';
import { BlogsWriteRepository } from '@/blogs/repositories/blogs.write.repository';
import { PostsService } from '@/posts/posts.service';
import { PostsQueryRepository } from '@/posts/repositories/posts.query.repository';
import { PostsWriteRepository } from '@/posts/repositories/posts.write.repository';
import { UsersService } from '@/users/users.service';
import { UsersQueryRepository } from '@/users/repositories/users.query.repository';
import { UsersWriteRepository } from '@/users/repositories/users.write.repository';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'env/.env', isGlobal: true }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.c1xap4q.mongodb.net/${process.env.MONGODB_DATABASE_NAME}?retryWrites=true&w=majority`,
    ),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: User.name, schema: UserEntity },
    ]),
  ],
  controllers: [BlogsController, PostsController, UsersController, TestingController, AppController],
  providers: [
    BlogsService,
    BlogsQueryRepository,
    BlogsWriteRepository,
    PostsService,
    PostsQueryRepository,
    PostsWriteRepository,
    UsersService,
    UsersQueryRepository,
    UsersWriteRepository,
    AppService,
  ],
})
export class AppModule {}
