import { Injectable } from '@nestjs/common';
import { SortDirections } from '../../../common/interfaces';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { PaginationUsersDto } from '../dto/pagination-users.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import UserEntity from '../../../db/entities/user.entity';

const allowedFieldForSorting = {
  id: 'id',
  login: 'login',
  email: 'email',
  createdAt: 'created_at',
};

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  public async findAll({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
    searchLoginTerm = '',
    searchEmailTerm = '',
  }: PaginationUsersDto): Promise<PaginationDto<UserEntity>> {
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

    const result = await this.dataSource.query<UserEntity[]>(query, queryParams);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount[0].count,
    });

    return new PaginationDto(result, paginationMetaDto);
  }

  public async findUserById(userId: string): Promise<UserEntity | null> {
    if (!userId || !Number.isInteger(+userId)) {
      return null;
    }

    return this.usersRepository.findOneBy({ id: +userId });
  }

  public async findByLoginOrEmail(loginOrEmail: string) {
    return this.usersRepository
      .createQueryBuilder()
      .select()
      .where('login = :login OR email = :email', { login: loginOrEmail, email: loginOrEmail })
      .getOne();
  }

  public async findByLogin(login: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ login });
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ email });
  }

  public async findByConfirmationCode(code: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ confirmation_code: code });
  }
}
