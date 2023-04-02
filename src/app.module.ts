import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PostsQueryRepository } from './posts/repositories/posts.query.repository';
import { PostsWriteRepository } from './posts/repositories/posts.write.repository';
import { PostsService } from './posts/posts.service';
import { BlogsService } from './blogs/blogs.service';
import { BlogsQueryRepository } from './blogs/repositories/blogs.query.repository';
import { BlogsWriteRepository } from './blogs/repositories/blogs.write.repository';
import { BlogsController } from './blogs/blogs.controller';
import { PostsController } from './posts/posts.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { TestingController } from './testing/testing.controller';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users/users.service';
import { UsersQueryRepository } from './users/repositories/users.query.repository';
import { UsersWriteRepository } from './users/repositories/users.write.repository';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'env/.env', isGlobal: true }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.c1xap4q.mongodb.net/${process.env.MONGODB_DATABASE_NAME}?retryWrites=true&w=majority`,
    ),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
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
