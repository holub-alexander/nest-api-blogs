import { Module } from '@nestjs/common';
import { FindAllUsersHandler } from './handlers/find-all-users.handler';
import { CreateUserHandler } from './handlers/create-user.handler';
import { DeleteUserHandler } from './handlers/delete-user.handler';
import { FindOneUserHandler } from './handlers/find-one-user.handler';
import { BanUnbanUserHandler } from './handlers/ban-unban-user.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersQueryRepository } from './repositories/users.query.repository';
import UserEntity from '../../db/entities/typeorm/user.entity';
import DeviceEntity from '../../db/entities/typeorm/device.entity';
import { UsersWriteRepository } from './repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/security-devices.write.repository';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';

export const CommandHandlers = [
  FindAllUsersHandler,
  CreateUserHandler,
  DeleteUserHandler,
  FindOneUserHandler,
  BanUnbanUserHandler,
];

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, DeviceEntity])],
  controllers: [],
  providers: [
    UsersQueryRepository,
    UsersWriteRepository,
    CommentsWriteRepository,
    SecurityDevicesWriteRepository,
    ...CommandHandlers,
  ],
})
export class UsersModule {}
