import { Module } from '@nestjs/common';
import { DeleteAllHandler } from './handlers/delete-all.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersWriteRepository } from '../Users/repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/security-devices.write.repository';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/posts.write.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { BanUserTypeOrmWriteRepository } from '../BanUser/repositories/typeorm/ban-user.write.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '../../db/entities/typeorm/user.entity';
import DeviceEntity from '../../db/entities/typeorm/device.entity';
import BlogEntity from '../../db/entities/typeorm/blog.entity';
import PostEntity from '../../db/entities/typeorm/post.entity';

export const CommandHandlers = [DeleteAllHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserEntity, DeviceEntity, BlogEntity, PostEntity])],
  controllers: [],
  providers: [
    BlogsWriteRepository,
    PostsWriteRepository,
    ReactionsWriteRepository,
    BanUserTypeOrmWriteRepository,
    UsersWriteRepository,
    SecurityDevicesWriteRepository,
    ...CommandHandlers,
  ],
})
export class TestingModule {}
