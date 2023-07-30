import { Injectable } from '@nestjs/common';
import { BanStatuses, SortDirections } from '../../../../common/interfaces';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { getObjectToSort } from '../../../../common/utils/get-object-to-sort';
import { PaginationMetaDto } from '../../../../common/dto/pagination-meta.dto';
import { PaginationUsersDto } from '../../dto/pagination-users.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import UserEntityTypeOrm from '../../../../db/entities/typeorm/user.entity';

const allowedFieldForSorting = {
  id: 'id',
  login: 'login',
  email: 'email',
  createdAt: 'created_at',
};

@Injectable()
export class UsersTypeOrmQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async findAll({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
    searchLoginTerm = '',
    searchEmailTerm = '',
    banStatus = BanStatuses.All,
  }: PaginationUsersDto): Promise<PaginationDto<UserEntityTypeOrm>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const pageNumberFormat = (+pageNumber - 1) * +pageSizeValue;

    const queryParams: (number | string | boolean)[] = [pageSizeValue, pageNumberFormat];
    const conditions: string[] = [];
    let bannedQuery = '';

    if (searchLoginTerm && searchLoginTerm.trim() !== '') {
      queryParams.push(`%${searchLoginTerm}%`);
      conditions.push('login ILIKE $' + queryParams.length);
    }

    if (searchEmailTerm && searchEmailTerm.trim() !== '') {
      queryParams.push(`%${searchEmailTerm}%`);
      conditions.push('email ILIKE $' + queryParams.length);
    }

    let query = `
      SELECT * FROM users
    `;

    if (banStatus === BanStatuses.Banned || banStatus === BanStatuses.NotBanned) {
      queryParams.push(`${BanStatuses.Banned === banStatus}`);
      bannedQuery += ' AND is_banned = $' + queryParams.length;
    }

    if (conditions.length > 0) {
      query += ' WHERE (' + conditions.join(' OR ') + ')';
      query += bannedQuery;
    }

    if (sorting) {
      query += `
      ORDER BY ${sorting.field} ${sorting.direction}
      `;
    }

    query += `
      OFFSET $2
      LIMIT $1;
    `;

    const result = await this.dataSource.query<UserEntityTypeOrm[]>(query, queryParams);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: result.length,
    });

    return new PaginationDto(result, paginationMetaDto);
  }

  public async findUserById(userId: string): Promise<UserEntityTypeOrm> {
    // const isValidId = ObjectId.isValid(userId);
    //
    // if (isValidId) {
    //   const findUser = await this.UserModel.findOne({ _id: new ObjectId(userId) });
    //
    //   if (findUser) {
    //     return findUser;
    //   }
    // }

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

    return result[0];
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

    return result[0];
  }

  public async findByConfirmationCode(code: string): Promise<UserEntityTypeOrm> {
    const result = await this.dataSource.query<UserEntityTypeOrm[]>(
      `
      SELECT * FROM users
      WHERE confirmation_code = $1;
    `,
      [code],
    );

    return result[0];
  }

  // public async findByDeviceId(login: string, deviceId: string): Promise<UserDocument | null> {
  //   return this.UserModel.findOne({
  //     'accountData.login': login,
  //     'refreshTokensMeta.deviceId': deviceId,
  //   });
  // }
}
