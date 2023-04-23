import { Module } from '@nestjs/common';
import { UsersQueryRepository } from './repositories/users.query.repository';
import { UsersWriteRepository } from './repositories/users.write.repository';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserEntity } from '../../entity/user.entity';
import { FindAllUsersHandler } from './handlers/find-all-users.handler';
import { CreateUserHandler } from './handlers/create-user.handler';
import { DeleteUserHandler } from './handlers/delete-user.handler';

export const CommandHandlers = [FindAllUsersHandler, CreateUserHandler, DeleteUserHandler];

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserEntity }])],
  controllers: [],
  providers: [UsersQueryRepository, UsersWriteRepository, UsersService, ...CommandHandlers],
})
export class UsersModule {}
