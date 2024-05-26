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
  id: 'blogs.id',
  name: 'blogs.name',
  description: 'blogs.description',
  websiteUrl: 'blogs.website_url',
  createdAt: 'blogs.created_at',
  isMembership: 'blogs.is_membership',
};

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
  ) {}

  public async findAllWithPagination(
    {
      sortBy = 'createdAt',
      sortDirection = SortDirections.DESC,
      searchNameTerm = '',
      pageSize = 10,
      pageNumber = 1,
    }: PaginationBlogDto,
    userId?: number,
    isReturnAll = false,
  ): Promise<PaginationDto<BlogEntity>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;

    const totalCountQuery = await this.blogRepository.createQueryBuilder('blogs');
    const query = await this.blogRepository.createQueryBuilder('blogs');

    if (searchNameTerm && searchNameTerm.trim() !== '') {
      totalCountQuery.where('name ILIKE :name', { name: `%${searchNameTerm}%` });
      query.where('name ILIKE :name', { name: `%${searchNameTerm}%` });
    }

    if (userId) {
      totalCountQuery.andWhere('user_id = :userId', { userId });
      query.andWhere('user_id = :userId', { userId });
    }

    if (!isReturnAll) {
      totalCountQuery.andWhere('blogs.is_banned = :isBanned', { isBanned: false });
      query.andWhere('blogs.is_banned = :isBanned', { isBanned: false });
    }

    const totalCount = await totalCountQuery
      .leftJoinAndSelect('blogs.user', 'user')
      .andWhere('user.is_banned = :value', { value: false })
      .getCount();

    const blogs = await query
      .leftJoinAndSelect('blogs.user', 'user')
      .leftJoinAndSelect('blogs.blog_wallpaper', 'blog_wallpaper')
      .leftJoinAndSelect('blogs.blog_main_images', 'blog_main_images')
      .andWhere('user.is_banned = :value', { value: false })
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

  public async findOne(blogId: string, isShowAll = false): Promise<BlogEntity | null> {
    if (!blogId || !Number.isInteger(+blogId)) {
      return null;
    }

    return this.blogRepository.findOneBy({
      id: +blogId,
      user: { is_banned: false },
      ...(isShowAll ? {} : { is_banned: false }),
    });
  }
}
