import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, ILike, Repository } from 'typeorm';
import BannedUserInBlogEntity from '../../../db/entities/banned-user-in-blog.entity';
import { SortDirections } from '../../../common/interfaces';
import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationBannedUsersDto } from '../dto/pagination-banned-users.dto';

@Injectable()
export class BannedUserInBlogQueryRepository {
  constructor(
    @InjectRepository(BannedUserInBlogEntity)
    private readonly bannedUserInBlogQueryRepository: Repository<BannedUserInBlogEntity>,
  ) {}

  public async find(queryOptions: FindOneOptions<BannedUserInBlogEntity>) {
    return this.bannedUserInBlogQueryRepository.findOne(queryOptions);
  }

  public async findAllWithPagination(
    blogId: number,
    {
      pageSize = 10,
      pageNumber = 1,
      sortDirection = SortDirections.DESC,
      sortBy = '',
      searchLoginTerm = '',
    }: PaginationBannedUsersDto,
  ) {
    const allowedFieldForSorting = {
      id: 'user.id',
      login: 'user.login',
      isBanned: 'banned_users.is_banned',
      banDate: 'banned_users.created_at',
      banReason: 'banned_users.ban_reason',
    };

    const sorting = getObjectToSort({
      sortBy,
      sortDirection,
      allowedFieldForSorting,
      defaultField: allowedFieldForSorting.banDate,
    });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;

    const sourceQuery = this.bannedUserInBlogQueryRepository
      .createQueryBuilder('banned_users')
      .leftJoinAndSelect('banned_users.blog', 'blog')
      .leftJoinAndSelect('banned_users.user', 'user')
      .where('blog.id = :blogId', { blogId })
      .andWhere('banned_users.is_banned = :isBanned', { isBanned: true });

    if (searchLoginTerm) {
      sourceQuery.andWhere({ user: { login: ILike(`%${searchLoginTerm}%`) } });
    }

    const totalCount = await sourceQuery.getCount();

    const bannedUsers = await sourceQuery
      .orderBy(sorting.field, sorting.direction.toUpperCase() as 'ASC' | 'DESC')
      .skip(skippedItems)
      .take(pageSizeValue)
      .getMany();

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount,
    });

    return new PaginationDto(bannedUsers, paginationMetaDto);
  }
}
