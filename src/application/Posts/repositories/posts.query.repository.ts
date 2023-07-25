import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { SortDirections } from '../../../common/interfaces';
import { PostViewModel } from '../interfaces';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { getObjectToSort } from '../../../common/utils/mongoose/get-object-to-sort';
import { Post, PostDocument } from '../../../db/entities/mongoose/post.entity';

type PostViewFields = Pick<PostViewModel, 'blogName'> & { [key: string]: string };

const getFieldToSort = (field: string): string => {
  const fields: PostViewFields = {
    blogName: 'blog.name',
  };

  return fields[field] ? fields[field] : field;
};

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private readonly PostModel: Model<PostDocument>) {}

  public async findAllByUserId(userId: ObjectId) {
    return this.PostModel.find({ 'userInfo.id': userId });
  }

  public async findAllWithPagination({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
  }: PaginationOptionsDto): Promise<PaginationDto<PostDocument>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, field: getFieldToSort(sortBy) });
    const filter = { 'userInfo.isBanned': false, isBanned: false };
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;

    const totalCount = await this.PostModel.countDocuments(filter);
    const items = await this.PostModel.find<PostDocument>(filter)
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount,
    });

    return new PaginationDto(items, paginationMetaDto);
  }

  public async findAllByBlogId(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    id: ObjectId,
  ): Promise<PaginationDto<PostDocument>> {
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const filter = { 'blog.id': id, 'userInfo.isBanned': false, isBanned: false };
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;

    const totalCount = await this.PostModel.find(filter).countDocuments({});
    const items = await this.PostModel.find<PostDocument>(filter)
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount,
    });

    return new PaginationDto(items, paginationMetaDto);
  }

  public async findOne(postId: string): Promise<PostDocument | null> {
    const isValidId = ObjectId.isValid(postId);

    if (isValidId) {
      const data = await this.PostModel.findOne({
        _id: new ObjectId(postId),
        'userInfo.isBanned': false,
        isBanned: false,
      });

      if (data) {
        return data;
      }
    }

    return null;
  }
}
