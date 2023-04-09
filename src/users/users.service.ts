import { Injectable } from '@nestjs/common';
import { UserViewModel } from './interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/entity/user.entity';
import { UsersQueryRepository } from '@/users/repositories/users.query.repository';
import { UsersWriteRepository } from '@/users/repositories/users.write.repository';
import { UsersMapper } from '@/common/mappers/users.mapper';
import { Paginator } from '@/common/interfaces';
import { PaginationUsersDto } from '@/users/dto/pagination-users.dto';
import { CreateUserDto } from '@/users/dto/create.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersWriteRepository: UsersWriteRepository,
  ) {}

  async findAll(queryParams: PaginationUsersDto): Promise<Paginator<UserViewModel[]>> {
    const { meta, items } = await this.usersQueryRepository.findAll(queryParams);

    return {
      ...meta,
      items: UsersMapper.mapUsersViewModel(items),
    };
  }

  async create({ email, password, login }: CreateUserDto) {
    const createUserData = new this.UserModel({
      accountData: { email, login, password, createdAt: new Date().toISOString() },
    });
    const newUser = await this.usersWriteRepository.create(createUserData);

    return newUser ? UsersMapper.mapCreatedUserViewModel(newUser) : null;
  }
}
