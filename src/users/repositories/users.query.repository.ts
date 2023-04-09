import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/entity/user.entity';
import { getObjectToSort } from '@/common/utils/get-object-to-sort';
import { SortDirections } from '@/common/interfaces';
import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserViewModel } from '@/users/interfaces';

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
  }): Promise<PaginationDto<UserDocument>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, field: getFieldToSort(sortBy), getField: getFieldToSort });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter = {
      $or: [
        { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },
        { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } },
      ],
    };

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
}
