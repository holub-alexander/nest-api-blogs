import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../../entity/blog.entity';
import { SortDirections } from '../../../common/interfaces';
import { PaginationBlogDto } from '../dto/pagination-blog.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { getObjectToSort } from '../../../common/utils/get-object-to-sort';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private readonly BlogModel: Model<BlogDocument>) {}

  public async findAll(
    {
      sortBy = 'createdAt',
      sortDirection = SortDirections.DESC,
      searchNameTerm = '',
      pageSize = 10,
      pageNumber = 1,
    }: PaginationBlogDto,
    userId?: ObjectId | null,
    isShowAllBlogs = false,
  ): Promise<PaginationDto<BlogDocument>> {
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter: {
      name: { $regex: string; $options: string };
      'bloggerInfo.isBanned'?: boolean;
      'bloggerInfo.id'?: ObjectId;
    } = {
      name: { $regex: searchNameTerm, $options: 'i' },
    };

    if (!isShowAllBlogs) {
      filter['bloggerInfo.isBanned'] = false;
    }

    if (userId) {
      filter['bloggerInfo.id'] = userId;
    }

    const totalCount = await this.BlogModel.countDocuments(filter);
    const items = await this.BlogModel.find<BlogDocument>(filter)
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount,
    });

    return new PaginationDto(items, paginationMetaDto);
  }

  public async findOne(blogId: string): Promise<BlogDocument | null> {
    const isValidId = ObjectId.isValid(blogId);

    if (isValidId) {
      const blog = await this.BlogModel.findOne<BlogDocument>({
        _id: new ObjectId(blogId),
        'bloggerInfo.isBanned': false,
      });

      if (blog) {
        return blog;
      }
    }

    return null;
  }
}
