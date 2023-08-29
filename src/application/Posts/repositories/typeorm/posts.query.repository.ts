import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { SortDirections } from '../../../../common/interfaces';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { PaginationOptionsDto } from '../../../../common/dto/pagination-options.dto';
import { PaginationMetaDto } from '../../../../common/dto/pagination-meta.dto';
import { Post, PostDocument } from '../../../../db/entities/mongoose/post.entity';
import { getObjectToSort } from '../../../../common/utils/get-object-to-sort';
import { DataSource } from 'typeorm';
import PostEntityTypeOrm from '../../../../db/entities/typeorm/post.entity';

const allowedFieldForSorting = {
  id: 'id',
  title: 'title',
  shortDescription: 'short_description',
  content: 'content',
  blogId: 'blog_id',
  blogName: 'blog_name',
  createdAt: 'created_at',
};

@Injectable()
export class PostsTypeOrmQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: Model<PostDocument>,
    private readonly dataSource: DataSource,
  ) {}

  public async findAllByUserId(userId: ObjectId) {
    return this.PostModel.find({ 'userInfo.id': userId });
  }

  public async findAllWithPagination(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    blogId: number | null = null,
  ): Promise<PaginationDto<PostEntityTypeOrm>> {
    // const sorting = getObjectToSort({ sortBy, sortDirection, field: getFieldToSort(sortBy) });
    // const filter = { 'userInfo.isBanned': false, isBanned: false };
    // const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    //
    // const totalCount = await this.PostModel.countDocuments(filter);
    // const items = await this.PostModel.find<PostDocument>(filter)
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

    console.log('blogId', blogId);

    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const pageNumberFormat = (+pageNumber - 1) * +pageSizeValue;
    const queryParams: (number | string | boolean)[] = [pageSizeValue, pageNumberFormat];
    const whereConditions: string[] = [];

    const whereConditionsTotal: string[] = [];
    const totalQueryParams: (number | string | boolean)[] = [];

    queryParams.push(false);
    whereConditions.push('users.is_banned = $' + queryParams.length);
    queryParams.push(false);
    whereConditions.push(' AND blogs.is_banned = $' + queryParams.length);

    totalQueryParams.push(false);
    whereConditionsTotal.push('users.is_banned = $' + totalQueryParams.length);
    totalQueryParams.push(false);
    whereConditionsTotal.push(' AND blogs.is_banned = $' + totalQueryParams.length);

    if (blogId) {
      queryParams.push(blogId);
      whereConditions.push(' AND blogs.id = $' + queryParams.length);

      totalQueryParams.push(blogId);
      whereConditionsTotal.push(' AND blogs.id = $' + totalQueryParams.length);
    }

    let query = `
      SELECT posts.*, users.id AS user_id, users.is_banned AS user_is_banned, blogs.name AS blog_name FROM posts
      JOIN users ON users.id = posts.user_id
      JOIN blogs ON blogs.id = posts.blog_id
      WHERE ${whereConditions.join('')}
    `;

    const totalCountQuery = `
      SELECT COUNT(*) FROM posts
      JOIN users ON users.id = posts.user_id
      JOIN blogs ON blogs.id = posts.blog_id
      WHERE ${whereConditionsTotal.join('')}
    `;

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

    const result = await this.dataSource.query<PostEntityTypeOrm[]>(query, queryParams);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount[0].count,
    });

    return new PaginationDto(result, paginationMetaDto);
  }

  public async findAllByBlogId(
    paginationOptions: PaginationOptionsDto,
    id: number,
  ): Promise<PaginationDto<PostEntityTypeOrm>> {
    // const sorting = getObjectToSort({ sortBy, sortDirection });
    // const filter = { 'blog.id': id, 'userInfo.isBanned': false, isBanned: false };
    // const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    //
    // const totalCount = await this.PostModel.find(filter).countDocuments({});
    // const items = await this.PostModel.find<PostDocument>(filter)
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

    return this.findAllWithPagination(paginationOptions, id);
  }

  public async findOne(postId: string): Promise<PostEntityTypeOrm[] | null> {
    // const isValidId = ObjectId.isValid(postId);
    //
    // if (isValidId) {
    //   const data = await this.PostModel.findOne({
    //     _id: new ObjectId(postId),
    //     'userInfo.isBanned': false,
    //     isBanned: false,
    //   });
    //
    //   if (data) {
    //     return data;
    //   }
    // }
    //
    // return null;

    if (!postId || !Number.isInteger(+postId)) {
      return null;
    }

    return this.dataSource.query(
      `
      SELECT posts.*, users.id AS user_id, users.is_banned AS user_is_banned, blogs.name AS blog_name FROM posts
      JOIN users ON users.id = posts.user_id
      JOIN blogs ON blogs.id = posts.blog_id
      WHERE users.is_banned = false AND blogs.is_banned = false AND posts.id = $1;
    `,
      [postId],
    );
  }
}
