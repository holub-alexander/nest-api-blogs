import { ObjectId } from 'mongodb';
import { getObjectToSort } from '@/common/utils/get-object-to-sort';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '@/entity/blog.entity';
import { SortDirections } from '@/common/interfaces';
import { PaginationBlogDto } from '@/blogs/dto/pagination-blog.dto';
import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private readonly BlogModel: Model<BlogDocument>) {}

  public async findAll({
    sortBy = 'createdAt',
    sortDirection = SortDirections.DESC,
    searchNameTerm = '',
    pageSize = 10,
    pageNumber = 1,
  }: PaginationBlogDto): Promise<PaginationDto<BlogDocument>> {
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter = { name: { $regex: searchNameTerm, $options: 'i' } };

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
      const blog = await this.BlogModel.findById<BlogDocument>(new ObjectId(blogId));

      if (blog) {
        return blog;
      }
    }

    return null;
  }
}
