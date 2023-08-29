import { Injectable } from '@nestjs/common';

import { SortDirections } from '../../../../common/interfaces';
import { PaginationBlogDto } from '../../dto/pagination-blog.dto';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { PaginationMetaDto } from '../../../../common/dto/pagination-meta.dto';

import { getObjectToSort } from '../../../../common/utils/get-object-to-sort';
import { DataSource, Repository } from 'typeorm';
import BlogEntityTypeOrm from '../../../../db/entities/typeorm/blog.entity';

const allowedFieldForSorting = {
  id: 'id',
  name: 'name',
  description: 'description',
  websiteUrl: 'website_url',
  createdAt: 'created_at',
  isMembership: 'is_membership',
};

@Injectable()
export class BlogsTypeOrmQueryRepository {
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
    // const sorting = getObjectToSort({ sortBy, sortDirection });
    // const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    // const filter: {
    //   name: { $regex: string; $options: string };
    //   'bloggerInfo.isBanned'?: boolean;
    //   'bloggerInfo.id'?: ObjectId;
    //   'banInfo.isBanned'?: boolean;
    // } = {
    //   name: { $regex: searchNameTerm, $options: 'i' },
    // };
    //
    // if (!isShowAllBlogs) {
    //   filter['bloggerInfo.isBanned'] = false;
    //   filter['banInfo.isBanned'] = false;
    // }
    //
    // if (userId) {
    //   filter['bloggerInfo.id'] = userId;
    // }
    //
    // const totalCount = await this.BlogModel.countDocuments(filter);
    // const items = await this.BlogModel.find<BlogDocument>(filter)
    //   .skip((+pageNumber - 1) * +pageSizeValue)
    //   .limit(+pageSizeValue)
    //   .sort(sorting);
    //
    // const paginationMetaDto = new PaginationMetaDto({
    //   paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
    //   totalCount,
    // });
    //
    // return new PaginationDto(items, paginationMetaDto);

    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const pageNumberFormat = (+pageNumber - 1) * +pageSizeValue;

    const queryParams: (number | string | boolean)[] = [pageSizeValue, pageNumberFormat];
    const conditions: string[] = [];
    let bannedQuery = '';

    const totalQueryParams: (number | string | boolean)[] = [];
    const totalQueryConditions: string[] = [];
    let totalBannedQuery = '';

    if (searchNameTerm && searchNameTerm.trim() !== '') {
      queryParams.push(`%${searchNameTerm}%`);
      conditions.push('name ILIKE $' + queryParams.length);

      totalQueryParams.push(`%${searchNameTerm}%`);
      totalQueryConditions.push('name ILIKE $' + totalQueryParams.length);
    }

    let query = `
      SELECT blogs.*, users.login AS user_login, users.is_banned AS user_is_banned FROM blogs
      JOIN users ON users.id = blogs.user_id
    `;

    let totalCountQuery = `
      SELECT COUNT(*) FROM blogs
      JOIN users ON users.id = blogs.user_id
    `;

    if (!isShowAllBlogs) {
      queryParams.push(false);
      bannedQuery += 'blogs.is_banned = $' + queryParams.length;
      queryParams.push(false);
      bannedQuery += ' AND users.is_banned = $' + queryParams.length;

      totalQueryParams.push(false);
      totalBannedQuery += 'blogs.is_banned = $' + totalQueryParams.length;
      totalQueryParams.push(false);
      totalBannedQuery += ' AND users.is_banned = $' + totalQueryParams.length;
    }

    if (userId) {
      queryParams.push(userId);
      bannedQuery += ' AND user_id = $' + queryParams.length;

      totalQueryParams.push(userId);
      totalBannedQuery += ' AND user_id = $' + totalQueryParams.length;
    }

    if (conditions.length > 0) {
      query += ' WHERE (' + conditions.join(' OR ') + ')';

      if (bannedQuery) {
        query += ' AND ' + bannedQuery;
      }

      totalCountQuery += ' WHERE (' + totalQueryConditions.join(' OR ') + ')';

      if (totalBannedQuery) {
        totalCountQuery += ' AND ' + totalBannedQuery;
      }
    } else if (bannedQuery) {
      query += ` WHERE ${bannedQuery}`;

      totalCountQuery += ` WHERE ${totalBannedQuery}`;
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
    // const isValidId = ObjectId.isValid(blogId);
    //
    // if (isValidId) {
    //   const filter: { _id: ObjectId; 'banInfo.isBanned'?: boolean; 'bloggerInfo.isBanned'?: boolean } = {
    //     _id: new ObjectId(blogId),
    //   };
    //
    //   if (!isFindBanned) {
    //     filter['bloggerInfo.isBanned'] = false;
    //     filter['banInfo.isBanned'] = false;
    //   }
    //
    //   const blog = await this.BlogModel.findOne<BlogDocument>(filter);
    //
    //   if (blog) {
    //     return blog;
    //   }
    // }
    //
    // return null;

    if (!blogId || !Number.isInteger(+blogId)) {
      return null;
    }

    if (!isFindBanned) {
      return this.dataSource.query<BlogEntityTypeOrm[]>(
        `
        SELECT blogs.*, users.login AS user_login, users.is_banned AS user_is_banned FROM blogs
        JOIN users ON users.id = blogs.user_id
        WHERE users.is_banned = $1 AND blogs.is_banned = $2 AND blogs.id = $3
      `,
        [false, false, blogId],
      );
    } else {
      return this.dataSource.query<BlogEntityTypeOrm[]>(
        `
        SELECT * FROM blogs
        WHERE id = $1
      `,
        [blogId],
      );
    }
  }
}
