import { Injectable } from '@nestjs/common';
import { SortDirections } from '../../../../common/interfaces';
import { PaginationMetaDto } from '../../../../common/dto/pagination-meta.dto';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { PaginationBannedUsersDto } from '../../../Blogger/dto/pagination-banned-users.dto';
import { DataSource } from 'typeorm';
import BannedUserInBlogEntity from '../../../../db/entities/typeorm/banned-user-in-blog.entity';
import { getObjectToSort } from '../../../../common/utils/get-object-to-sort';

const allowedFieldForSorting = {
  id: 'id',
  login: 'user_login',
  isBanned: 'is_banned',
  banDate: 'created_at',
  banReason: 'ban_reason',
};

@Injectable()
export class BanUserTypeOrmQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  public async findBanedUserForBlog(userId: number, blogId: number): Promise<BannedUserInBlogEntity[]> {
    // return this.BanUserModel.findOne({ 'user.id': userId, blogId });

    return this.dataSource.query<BannedUserInBlogEntity[]>(
      `
        SELECT * FROM banned_users_in_blogs
        WHERE user_id = $1 AND blog_id = $2;
      `,
      [userId, blogId],
    );
  }

  public async findAllBannedUsersForBlog(
    {
      pageSize = 10,
      pageNumber = 1,
      sortDirection = SortDirections.DESC,
      sortBy = '',
      searchLoginTerm = '',
    }: PaginationBannedUsersDto,
    blogId: number,
  ) {
    // const sorting = getObjectToSort({ sortBy, sortDirection, field: getFieldToSort(sortBy), getField: getFieldToSort });
    // const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    // const filter = { blogId, 'user.login': { $regex: searchLoginTerm, $options: 'i' } };
    //
    // // @ts-ignore
    // const totalCount = await this.BanUserModel.countDocuments(filter);
    // // @ts-ignore
    // const items = await this.BanUserModel.find<BanUserDocument>(filter)
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

    const totalQueryParams: (number | string | boolean)[] = [];
    const totalQueryConditions: string[] = [];

    if (searchLoginTerm && searchLoginTerm.trim() !== '') {
      queryParams.push(`%${searchLoginTerm}%`);
      conditions.push('users.login ILIKE $' + queryParams.length);

      totalQueryParams.push(`%${searchLoginTerm}%`);
      totalQueryConditions.push('users.login ILIKE $' + totalQueryParams.length);
    }

    if (blogId) {
      queryParams.push(blogId);
      conditions.push('blog_id = $' + queryParams.length);

      totalQueryParams.push(blogId);
      totalQueryConditions.push('blog_id = $' + totalQueryParams.length);
    }

    let query = `
      SELECT banned_users.*, users.login as user_login FROM banned_users_in_blogs AS banned_users
      JOIN users ON users.id = banned_users.user_id
    `;

    let totalCountQuery = `
      SELECT COUNT(*) FROM banned_users_in_blogs AS banned_users
      JOIN users ON users.id = banned_users.user_id
    `;

    if (conditions.length > 0) {
      query += ' WHERE (' + conditions.join(' AND ') + ')';
      totalCountQuery += ' WHERE (' + totalQueryConditions.join(' AND ') + ')';
    }

    if (sorting) {
      query += `
      ORDER BY ${sorting.field} ${sorting.direction}
      `;
    }

    const totalCount = await this.dataSource.query(totalCountQuery, totalQueryParams);

    query += `
      OFFSET $2
      LIMIT $1;
    `;

    const result = await this.dataSource.query<BannedUserInBlogEntity[]>(query, queryParams);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount[0].count,
    });

    return new PaginationDto(result, paginationMetaDto);
  }
}
