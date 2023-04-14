import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { SortDirections } from '../../common/interfaces';
import { PostViewModel } from '../interfaces';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationOptionsDto } from '../../common/dto/pagination-options.dto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { getObjectToSort } from '../../common/utils/get-object-to-sort';
import { Post, PostDocument } from '../../entity/post.entity';

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

  public async findAll({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
  }: PaginationOptionsDto): Promise<PaginationDto<PostDocument>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, field: getFieldToSort(sortBy) });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;

    const totalCount = await this.PostModel.countDocuments({});
    const items = await this.PostModel.find<PostDocument>()
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
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;

    const totalCount = await this.PostModel.find({ 'blog.id': id }).countDocuments({});
    const items = await this.PostModel.find<PostDocument>({ 'blog.id': id })
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
      const data = await this.PostModel.findById(new ObjectId(postId));

      if (data) {
        return data;
      }
    }

    return null;
  }
}
