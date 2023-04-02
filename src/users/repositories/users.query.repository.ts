import { Injectable } from '@nestjs/common';
import { Paginator, SortDirections } from '../../@types';
import { getObjectToSort } from '../../utils/get-object-to-sort';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { PostViewModel } from '../../posts/@types';
import { UserViewModel } from '../@types';

type UserViewFields = {
  [key in keyof UserViewModel]: string;
};

const getFieldToSort = (field: string): string => {
  const fields: UserViewFields = {
    id: '_id',
    login: 'accountData.login',
    email: 'accountData.email',
    createdAt: 'accountData.createdAt',
  };

  // @ts-ignore
  return fields[field] ? fields[field] : field;
};

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  public async findAll({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
    searchLoginTerm = '',
    searchEmailTerm = '',
  }): Promise<Paginator<UserDocument[]>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, field: getFieldToSort(sortBy) });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter = {
      $or: [
        { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },
        { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } },
      ],
    };

    const totalCount = await this.UserModel.countDocuments(filter);
    const res = await this.UserModel.find<UserDocument>(filter)
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: res,
    };
  }
}
