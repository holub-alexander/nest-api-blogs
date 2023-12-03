import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BanUser, BanUserDocument } from '../../../../mongoose/ban-user.entity';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { getObjectToSort } from '../../../../common/utils/mongoose/get-object-to-sort';
import { SortDirections } from '../../../../common/interfaces';
import { PaginationMetaDto } from '../../../../common/dto/pagination-meta.dto';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { PaginationBannedUsersDto } from '../../../Blogger/dto/pagination-banned-users.dto';
import { UserBloggerViewModel } from '../../../Blogger/interfaces';

type UserViewFields = {
  [key in keyof UserBloggerViewModel]: string;
};

const getFieldToSort = (field: string): string => {
  // @ts-ignore
  const fields: UserViewFields = {
    id: '_id',
    login: 'user.login',
  };

  // @ts-ignore
  return fields[field] ? fields[field] : field;
};

@Injectable()
export class BanUserQueryRepository {
  constructor(@InjectModel(BanUser.name) private readonly BanUserModel: Model<BanUserDocument>) {}

  public async findBanForBlog(userId: ObjectId, blogId: ObjectId) {
    return this.BanUserModel.findOne({ 'user.id': userId, blogId });
  }

  public async findAllBannedUsersForBlog(
    {
      pageSize = 10,
      pageNumber = 1,
      sortDirection = SortDirections.DESC,
      sortBy = '',
      searchLoginTerm = '',
    }: PaginationBannedUsersDto,
    blogId: ObjectId,
  ) {
    const sorting = getObjectToSort({ sortBy, sortDirection, field: getFieldToSort(sortBy), getField: getFieldToSort });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter = { blogId, 'user.login': { $regex: searchLoginTerm, $options: 'i' } };

    const totalCount = await this.BanUserModel.countDocuments(filter);
    const items = await this.BanUserModel.find<BanUserDocument>(filter)
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
