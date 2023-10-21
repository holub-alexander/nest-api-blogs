import { Injectable } from '@nestjs/common';
import { SortDirections } from '../../../common/interfaces';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { PaginationUsersDto } from '../dto/pagination-users.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import UserEntityTypeOrm from '../../../db/entities/typeorm/user.entity';

const allowedFieldForSorting = {
  id: 'id',
  login: 'login',
  email: 'email',
  createdAt: 'created_at',
};

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async findAll({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
    searchLoginTerm = '',
    searchEmailTerm = '',
  }: PaginationUsersDto): Promise<PaginationDto<UserEntityTypeOrm>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const pageNumberFormat = (+pageNumber - 1) * +pageSizeValue;

    const queryParams: (number | string | boolean)[] = [pageSizeValue, pageNumberFormat];
    const conditions: string[] = [];

    const totalQueryParams: (number | string | boolean)[] = [];
    const totalQueryConditions: string[] = [];

    if (searchLoginTerm && searchLoginTerm.trim() !== '') {
      queryParams.push(`%${searchLoginTerm}%`);
      conditions.push('login ILIKE $' + queryParams.length);

      totalQueryParams.push(`%${searchLoginTerm}%`);
      totalQueryConditions.push('login ILIKE $' + totalQueryParams.length);
    }

    if (searchEmailTerm && searchEmailTerm.trim() !== '') {
      queryParams.push(`%${searchEmailTerm}%`);
      conditions.push('email ILIKE $' + queryParams.length);

      totalQueryParams.push(`%${searchEmailTerm}%`);
      totalQueryConditions.push('email ILIKE $' + totalQueryParams.length);
    }

    let query = `
      SELECT * FROM users
    `;

    let totalCountQuery = `
      SELECT COUNT(*) FROM users
    `;

    if (conditions.length > 0) {
      query += ' WHERE (' + conditions.join(' OR ') + ')';
      totalCountQuery += ' WHERE (' + totalQueryConditions.join(' OR ') + ')';
    }

    if (sorting) {
      query += `
      ORDER BY ${sorting.field} ${sorting.direction}
      `;
    }

    const totalCount = await this.dataSource.query<[{ count: string }]>(totalCountQuery, totalQueryParams);

    query += `
      OFFSET $2
      LIMIT $1;
    `;

    const result = await this.dataSource.query<UserEntityTypeOrm[]>(query, queryParams);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount[0].count,
    });

    return new PaginationDto(result, paginationMetaDto);
  }

  public async findUserById(userId: string): Promise<UserEntityTypeOrm | null> {
    if (!userId || !Number.isInteger(+userId)) {
      return null;
    }

    const result = await this.dataSource.query<UserEntityTypeOrm[]>(
      `
      SELECT * FROM users
      WHERE id = $1;
    `,
      [userId],
    );

    return result[0];
  }

  public async findByLoginOrEmail(loginOrEmail: string) {
    const result = await this.dataSource.query<[UserEntityTypeOrm]>(
      `
      SELECT * FROM users
      WHERE login = $1 OR email = $1;
    `,
      [loginOrEmail],
    );

    return result[0];
  }

  public async findByLogin(login: string): Promise<UserEntityTypeOrm | null> {
    const result = await this.dataSource.query<UserEntityTypeOrm[]>(
      `
      SELECT * FROM users
      WHERE login = $1
      LIMIT 1;
    `,
      [login],
    );

    return result[0] || null;
  }

  public async findByEmail(email: string): Promise<UserEntityTypeOrm | null> {
    const result = await this.dataSource.query<UserEntityTypeOrm[]>(
      `
      SELECT * FROM users
      WHERE email = $1
      LIMIT 1;
    `,
      [email],
    );

    return result[0] || null;
  }

  public async findByConfirmationCode(code: string): Promise<UserEntityTypeOrm | null> {
    const result = await this.dataSource.query<UserEntityTypeOrm[]>(
      `
      SELECT * FROM users
      WHERE confirmation_code = $1;
    `,
      [code],
    );

    return result[0] || null;
  }
}
