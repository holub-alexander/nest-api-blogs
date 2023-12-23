import { Injectable } from '@nestjs/common';

import { SortDirections } from '../../../common/interfaces';
import { PaginationBlogDto } from '../dto/pagination-blog.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { Repository } from 'typeorm';
import BlogEntity from '../../../db/entities/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';

const allowedFieldForSorting = {
  id: 'id',
  name: 'name',
  description: 'description',
  websiteUrl: 'website_url',
  createdAt: 'created_at',
  isMembership: 'is_membership',
};

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
  ) {}

  public async findAllWithPagination({
    sortBy = 'createdAt',
    sortDirection = SortDirections.DESC,
    searchNameTerm = '',
    pageSize = 10,
    pageNumber = 1,
  }: PaginationBlogDto): Promise<PaginationDto<BlogEntity>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;

    const totalCountQuery = await this.blogRepository.createQueryBuilder();
    const query = await this.blogRepository.createQueryBuilder();

    if (searchNameTerm && searchNameTerm.trim() !== '') {
      totalCountQuery.where('name ILIKE :name', { name: `%${searchNameTerm}%` });
      query.where('name ILIKE :name', { name: `%${searchNameTerm}%` });
    }

    const totalCount = await totalCountQuery.getCount();

    const blogs = await query
      .orderBy(sorting.field, sorting.direction.toUpperCase() as 'ASC' | 'DESC')
      .offset(skippedItems)
      .limit(pageSizeValue)
      .getMany();

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount,
    });

    return new PaginationDto(blogs, paginationMetaDto);
  }

  public async findOne(blogId: string): Promise<BlogEntity | null> {
    if (!blogId || !Number.isInteger(+blogId)) {
      return null;
    }

    return this.blogRepository.findOneBy({ id: +blogId });
  }
}
