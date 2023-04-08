import { Injectable } from '@nestjs/common';
import { Paginator, SortDirections } from '../@types';
import { UserInputModel, UserViewModel } from './@types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/entity/user.entity';
import { UsersQueryRepository } from '@/users/repositories/users.query.repository';
import { UsersWriteRepository } from '@/users/repositories/users.write.repository';
import { UsersMapper } from '@/common/mappers/users.mapper';

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
