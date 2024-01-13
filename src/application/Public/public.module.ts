import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsModule } from '../Blogs/blogs.module';
import { PublicBlogsController } from './controllers/public-blogs.controller';
import { PublicPostsController } from './controllers/public-posts.controller';
import { PostsModule } from '../Posts/posts.module';
import { CommentsModule } from '../Comments/comments.module';
import { PublicCommentsController } from './controllers/public-comments.controller';
import { PublicSecurityDevicesController } from './controllers/public-security-devices.controller';
import { MailService } from '../Mail/mail.service';
import { PublicAuthController } from './controllers/public-auth.controller';
import { SecurityDevicesService } from '../Security-Devices/security-devices.service';
import { AuthService } from '../Auth/auth.service';
import { TestingModule } from '../Testing/testing.module';
import { PublicTestingController } from './controllers/public-testing.controller';
import { ReactionsModule } from '../Reactions/reactions.module';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { UsersWriteRepository } from '../Users/repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/security-devices.write.repository';
import { SecurityDevicesQueryRepository } from '../Security-Devices/repositories/security-devices.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '../../db/entities/user.entity';
import DeviceEntity from '../../db/entities/device.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    CqrsModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    ReactionsModule,
    TestingModule,
    TypeOrmModule.forFeature([UserEntity, DeviceEntity]),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '10m' },
    }),
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
    SecurityDevicesWriteRepository,
    SecurityDevicesQueryRepository,
    UsersQueryRepository,
    UsersWriteRepository,
    SecurityDevicesService,
    AuthService,
    MailService,
  ],
})
export class PublicModule {}
