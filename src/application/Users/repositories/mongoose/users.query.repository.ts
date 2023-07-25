import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

import { User, UserDocument } from '../../../../db/entities/mongoose/user.entity';
import { BanStatuses, SortDirections } from '../../../../common/interfaces';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { getObjectToSort } from '../../../../common/utils/mongoose/get-object-to-sort';
import { PaginationMetaDto } from '../../../../common/dto/pagination-meta.dto';
import { PaginationUsersDto } from '../../dto/pagination-users.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import UserEntityTypeOrm from '../../../../db/entities/typeorm/user.entity';

const getFieldToSort = (field: string): string => {
  const fields: { [key: string]: string } = {
    id: '_id',
    login: 'accountData.login',
    email: 'accountData.email',
    createdAt: 'accountData.createdAt',
  };

  return fields[field] ? fields[field] : field;
};

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  public async findAll({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
    searchLoginTerm = '',
    searchEmailTerm = '',
    banStatus = BanStatuses.All,
  }: PaginationUsersDto): Promise<PaginationDto<UserDocument>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, field: getFieldToSort(sortBy), getField: getFieldToSort });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter: { $or: {}[]; 'accountData.isBanned'?: boolean } = {
      $or: [
        { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },
        { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } },
      ],
    };

    if (banStatus === BanStatuses.Banned || banStatus === BanStatuses.NotBanned) {
      filter['accountData.isBanned'] = BanStatuses.Banned === banStatus;
    }

    const totalCount = await this.UserModel.countDocuments(filter);
    const items = await this.UserModel.find<UserDocument>(filter)
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount,
    });

    return new PaginationDto(items, paginationMetaDto);
  }

  public async getUserById(userId: string): Promise<UserDocument | null> {
    const isValidId = ObjectId.isValid(userId);

    if (isValidId) {
      const findUser = await this.UserModel.findOne({ _id: new ObjectId(userId) });

      if (findUser) {
        return findUser;
      }
    }

    return null;
  }

  public async findByLoginOrEmail(loginOrEmail: string) {
    const result = await this.dataSource.query<[UserEntityTypeOrm]>(
      `
      SELECT * FROM users
      WHERE login = $1 OR email = $1;
    `,
      [loginOrEmail],
    );

    console.log('findByLoginOrEmail', result);

    return result[0];
  }

  public async findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ 'accountData.login': login });
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ 'accountData.email': email });
  }

  public async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ 'emailConfirmation.confirmationCode': code });
  }

  public async findByDeviceId(login: string, deviceId: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'accountData.login': login,
      'refreshTokensMeta.deviceId': deviceId,
    });
  }
}
