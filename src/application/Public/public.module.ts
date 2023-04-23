import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsModule } from '../Blogs/blogs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicBlogsController } from './controllers/public-blogs.controller';
import { PublicPostsController } from './controllers/public-posts.controller';
import { PostsModule } from '../Posts/posts.module';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { RefreshTokenEntity, RefreshTokensMeta, User, UserEntity } from '../../entity/user.entity';
import { CommentsModule } from '../Comments/comments.module';
import { PublicCommentsController } from './controllers/public-comments.controller';
import { SecurityDevicesQueryRepository } from '../Security-Devices/repositories/security-devices.query.repository';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/security-devices.write.repository';
import { PublicSecurityDevicesController } from './controllers/public-security-devices.controller';
import { UsersWriteRepository } from '../Users/repositories/users.write.repository';
import { MailService } from '../Mail/mail.service';
import { PublicAuthController } from './controllers/public-auth.controller';
import { SecurityDevicesService } from '../Security-Devices/security-devices.service';
import { AuthService } from '../Auth/auth.service';
import { TestingModule } from '../Testing/testing.module';
import { PublicTestingController } from './controllers/public-testing.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserEntity },
      { name: RefreshTokensMeta.name, schema: RefreshTokenEntity },
    ]),
    CqrsModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    TestingModule,
  ],
  controllers: [
    PublicBlogsController,
    PublicPostsController,
    PublicCommentsController,
    PublicSecurityDevicesController,
    PublicAuthController,
    PublicTestingController,
  ],
  providers: [
    SecurityDevicesQueryRepository,
    SecurityDevicesWriteRepository,
    UsersQueryRepository,
    UsersWriteRepository,
    SecurityDevicesService,
    AuthService,
    MailService,
  ],
})
export class PublicModule {}
