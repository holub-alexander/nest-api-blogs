import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Blog, BlogEntity } from './entity/blog.entity';
import { Post, PostEntity } from './entity/post.entity';
import { RefreshTokenEntity, RefreshTokensMeta, User, UserEntity } from './entity/user.entity';
import { BlogsController } from './blogs/blogs.controller';
import { PostsController } from './posts/posts.controller';
import { UsersController } from './users/users.controller';
import { TestingController } from './testing/testing.controller';
import { AppController } from './app.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsQueryRepository } from './blogs/repositories/blogs.query.repository';
import { BlogsWriteRepository } from './blogs/repositories/blogs.write.repository';
import { PostsService } from './posts/posts.service';
import { PostsQueryRepository } from './posts/repositories/posts.query.repository';
import { PostsWriteRepository } from './posts/repositories/posts.write.repository';
import { UsersService } from './users/users.service';
import { UsersQueryRepository } from './users/repositories/users.query.repository';
import { UsersWriteRepository } from './users/repositories/users.write.repository';
import { AppService } from './app.service';
import { IsBlogFound } from './posts/dto/create.dto';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AuthService } from './auth/auth.service';
import { SecurityDevicesService } from './security-devices/security-devices.service';
import { SecurityDevicesWriteRepository } from './security-devices/repositories/security-devices.write.repository';
import { SecurityDevicesQueryRepository } from './security-devices/repositories/security-devices.query.repository';
import { AuthController } from './auth/auth.controller';
import { MailService } from './mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SecurityDevicesController } from './security-devices/security-devices.controller';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsQueryRepository } from './comments/repositories/comments.query.repository';
import { CommentsWriteRepository } from './comments/repositories/comments.write.repository';
import { ReactionsWriteRepository } from './reactions/repositories/reactions.write.repository';
import { ReactionsQueryRepository } from './reactions/repositories/reactions.query.repository';
import { Comment, CommentEntity } from './entity/comment.entity';
import { Reaction, ReactionEntity } from './entity/reaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'env/.env', isGlobal: true }),

    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: config.get('ADMIN_EMAIL'),
            pass: config.get('GMAIL_APP_PASSWORD'),
          },
        },
        defaults: {
          from: `Alexander <${config.get('ADMIN_EMAIL')}>`,
        },
        template: {
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.c1xap4q.mongodb.net/${process.env.MONGODB_DATABASE_NAME}?retryWrites=true&w=majority`,
    ),

    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: User.name, schema: UserEntity },
      { name: RefreshTokensMeta.name, schema: RefreshTokenEntity },
      { name: Comment.name, schema: CommentEntity },
      { name: Reaction.name, schema: ReactionEntity },
    ]),

    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '10m' },
    }),
  ],
  controllers: [
    BlogsController,
    PostsController,
    SecurityDevicesController,
    UsersController,
    AuthController,
    TestingController,
    CommentsController,
    AppController,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    IsBlogFound,
    BlogsService,
    BlogsQueryRepository,
    BlogsWriteRepository,
    PostsService,
    PostsQueryRepository,
    PostsWriteRepository,
    UsersService,
    UsersQueryRepository,
    UsersWriteRepository,
    SecurityDevicesService,
    SecurityDevicesWriteRepository,
    SecurityDevicesQueryRepository,
    CommentsService,
    CommentsQueryRepository,
    CommentsWriteRepository,
    ReactionsWriteRepository,
    ReactionsQueryRepository,
    AuthService,
    MailService,
    AppService,
  ],
})
export class AppModule {}
