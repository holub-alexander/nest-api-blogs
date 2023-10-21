import { Injectable } from '@nestjs/common';

import { SortDirections } from '../../../common/interfaces';
import { PaginationBlogDto } from '../dto/pagination-blog.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { DataSource } from 'typeorm';
import BlogEntityTypeOrm from '../../../db/entities/typeorm/blog.entity';

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
  constructor(private readonly dataSource: DataSource) {}

  public async findAllWithPagination(
    {
      sortBy = 'createdAt',
      sortDirection = SortDirections.DESC,
      searchNameTerm = '',
      pageSize = 10,
      pageNumber = 1,
    }: PaginationBlogDto,
    userId?: number | null,
    isShowAllBlogs = false,
  ): Promise<PaginationDto<BlogEntityTypeOrm>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const pageNumberFormat = (+pageNumber - 1) * +pageSizeValue;

    const queryParams: (number | string | boolean)[] = [pageSizeValue, pageNumberFormat];
    const conditions: string[] = [];

    const totalQueryParams: (number | string | boolean)[] = [];
    const totalQueryConditions: string[] = [];

    if (searchNameTerm && searchNameTerm.trim() !== '') {
      queryParams.push(`%${searchNameTerm}%`);
      conditions.push('name ILIKE $' + queryParams.length);

      totalQueryParams.push(`%${searchNameTerm}%`);
      totalQueryConditions.push('name ILIKE $' + totalQueryParams.length);
    }

    let query = `
      SELECT blogs.* FROM blogs
    `;

    let totalCountQuery = `
      SELECT COUNT(*) FROM blogs
    `;

    if (conditions.length > 0) {
      query += ' WHERE (' + conditions.join(' OR ') + ')';
      totalCountQuery += ' WHERE (' + totalQueryConditions.join(' OR ') + ')';
    }

    if (sorting) {
      query += `
      ORDER BY blogs.${sorting.field} ${sorting.direction}
      `;
    }

    const totalCount = await this.dataSource.query(totalCountQuery, totalQueryParams);

    query += `
      OFFSET $2
      LIMIT $1;
    `;

    const result = await this.dataSource.query<BlogEntityTypeOrm[]>(query, queryParams);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount[0].count,
    });

    return new PaginationDto(result, paginationMetaDto);
  }

  public async findOne(blogId: string, isFindBanned = false): Promise<BlogEntityTypeOrm[] | null> {
    if (!blogId || !Number.isInteger(+blogId)) {
      return null;
    }

    return this.dataSource.query<BlogEntityTypeOrm[]>(
      `
        SELECT * FROM blogs
        WHERE id = $1
      `,
      [blogId],
    );
  }
}
