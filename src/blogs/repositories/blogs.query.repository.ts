import { ObjectId } from 'mongodb';
import { Paginator, SortDirections } from '../../@types';
import { BlogsQueryParams } from '../blogs.controller';
import { getObjectToSort } from '../../utils/get-object-to-sort';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../schemas/blog.schema';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  public async findAll({
    sortBy = 'createdAt',
    sortDirection = SortDirections.DESC,
    searchNameTerm = '',
    pageSize = 10,
    pageNumber = 1,
  }: BlogsQueryParams): Promise<Paginator<BlogDocument[]>> {
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter = { name: { $regex: searchNameTerm, $options: 'i' } };

    const totalCount = await this.BlogModel.countDocuments(filter);
    const res = await this.BlogModel.find<BlogDocument>(filter)
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

  public async findOne(blogId: string): Promise<BlogDocument | null> {
    const isValidId = ObjectId.isValid(blogId);

    if (isValidId) {
      const blog = await this.BlogModel.findById<BlogDocument>(new ObjectId(blogId));

      if (blog) {
        return blog;
      }
    }

    return null;
  }
}
