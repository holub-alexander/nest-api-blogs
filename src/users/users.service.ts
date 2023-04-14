import { Injectable } from '@nestjs/common';
import { UserViewModel } from './interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersQueryRepository } from './repositories/users.query.repository';
import { User, UserDocument } from '../entity/user.entity';
import { UsersWriteRepository } from './repositories/users.write.repository';
import { PaginationUsersDto } from './dto/pagination-users.dto';
import { CreateUserDto } from './dto/create.dto';
import { UsersMapper } from '../common/mappers/users.mapper';
import { Paginator } from '../common/interfaces';

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
      emailConfirmation: {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: true,
      },
      passwordRecovery: {
        recoveryCode: null,
      },
      refreshTokensMeta: [],
    });
    const newUser = await this.usersWriteRepository.create(createUserData);

    return newUser ? UsersMapper.mapCreatedUserViewModel(newUser) : null;
  }
}
