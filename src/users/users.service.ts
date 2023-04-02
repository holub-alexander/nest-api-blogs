import { Injectable } from '@nestjs/common';
import { Paginator, SortDirections } from '../@types';

import { UsersWriteRepository } from './repositories/users.write.repository';
import { UserInputModel, UserViewModel } from './@types';
import { UsersMapper } from '../mappers/users.mapper';
import { UsersQueryRepository } from './repositories/users.query.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    private usersQueryRepository: UsersQueryRepository,
    private usersWriteRepository: UsersWriteRepository,
  ) {}

  async findAll({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
    searchEmailTerm = '',
    searchLoginTerm = '',
  }): Promise<Paginator<UserViewModel[]>> {
    const res = await this.usersQueryRepository.findAll({
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    });

    return {
      ...res,
      items: UsersMapper.mapUsersViewModel(res.items),
    };
  }

  async create({ email, password, login }: UserInputModel) {
    const createUserData = new this.UserModel({
      accountData: { email, login, password, createdAt: new Date().toISOString() },
    });
    const newUser = await this.usersWriteRepository.create(createUserData);

    return newUser ? UsersMapper.mapCreatedUserViewModel(newUser) : null;
  }
}
