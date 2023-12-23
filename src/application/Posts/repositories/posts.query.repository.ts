import { Injectable } from '@nestjs/common';
import { SortDirections } from '../../../common/interfaces';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { DataSource, Repository } from 'typeorm';
import PostEntity from '../../../db/entities/post.entity';
import ReactionEntity from '../../../db/entities/reaction.entity';
import BlogEntity from '../../../db/entities/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';

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
export class PostsQueryRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>,
  ) {}

  public async findAllWithPagination(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    blogId: number | null = null,
  ): Promise<PaginationDto<PostEntity>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;

    // const queryParams: (number | string | boolean)[] = [pageSizeValue, pageNumberFormat];
    // const whereConditions: string[] = [];
    //
    // const whereConditionsTotal: string[] = [];
    // const totalQueryParams: (number | string | boolean)[] = [];
    //
    // if (blogId) {
    //   queryParams.push(blogId);
    //   whereConditions.push('blogs.id = $' + queryParams.length);
    //
    //   totalQueryParams.push(blogId);
    //   whereConditionsTotal.push('blogs.id = $' + totalQueryParams.length);
    // }
    //
    // let query = `
    //   SELECT posts.*,
    //   (SELECT COUNT(*)
    //      FROM reactions
    //      WHERE post_id = posts.id
    //        AND TYPE = 'post'
    //        AND post_id = posts.id
    //        AND like_status = 'Like' ) AS likes_count,
    //   (SELECT COUNT(*)
    //      FROM reactions
    //      WHERE post_id = posts.id
    //        AND TYPE = 'post'
    //        AND post_id = posts.id
    //        AND like_status = 'Dislike' ) AS dislikes_count,
    //   blogs.name AS blog_name FROM posts
    //
    //   JOIN blogs ON blogs.id = posts.blog_id
    //   ${whereConditions.length > 0 ? `WHERE ${whereConditions.join('')}` : ''}
    // `;
    //
    // const totalCountQuery = `
    //   SELECT COUNT(*) FROM posts
    //   JOIN blogs ON blogs.id = posts.blog_id
    //   ${whereConditionsTotal.length > 0 ? `WHERE ${whereConditionsTotal.join('')}` : ''}
    // `;
    //
    // if (sorting) {
    //   query += `
    //   ORDER BY ${sorting.field} ${sorting.direction}
    //   `;
    // }
    //
    // const totalCount = await this.dataSource.query<[{ count: string }]>(totalCountQuery, totalQueryParams);
    //
    // query += `
    //   OFFSET $2
    //   LIMIT $1;
    // `;
    //
    // const result = await this.dataSource.query<PostEntity[]>(query, queryParams);
    //
    // const paginationMetaDto = new PaginationMetaDto({
    //   paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
    //   totalCount: +totalCount[0].count,
    // });
    //
    // return new PaginationDto(result, paginationMetaDto);

    const totalCountQuery = await this.postRepository.createQueryBuilder('posts');
    const query = await this.postRepository.createQueryBuilder('posts');

    if (blogId) {
      totalCountQuery.where('blogs.id = :blogId', { blogId });
      query.where('blogs.id = :blogId', { blogId });
    }

    totalCountQuery.leftJoin(BlogEntity, 'blogs', 'blogs.id = posts.blog_id');

    const totalCount = await totalCountQuery.getCount();

    const posts = await query
      .select(['posts.*', 'blogs.name AS blog_name'])
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .where('reactions.post_id = posts.id')
          .andWhere('reactions.type = :type', { type: 'post' })
          .andWhere("reactions.like_status = 'Like'");
      }, 'likes_count')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .where('reactions.post_id = posts.id')
          .andWhere('reactions.type = :type', { type: 'post' })
          .andWhere("reactions.like_status = 'Dislike'");
      }, 'dislikes_count')
      .leftJoin(BlogEntity, 'blogs', `blogs.id = posts.blog_id`)
      .orderBy(sorting.field, sorting.direction.toUpperCase() as 'ASC' | 'DESC')
      .offset(skippedItems)
      .limit(pageSizeValue)
      .getRawMany();

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount,
    });

    return new PaginationDto(posts, paginationMetaDto);
  }

  public async findAllByBlogId(
    paginationOptions: PaginationOptionsDto,
    id: number,
  ): Promise<PaginationDto<PostEntity>> {
    return this.findAllWithPagination(paginationOptions, id);
  }

  public async findOne(postId: string): Promise<PostEntity | null> {
    if (!postId || !Number.isInteger(+postId)) {
      return null;
    }

    // return this.dataSource.query(
    //   `
    //    SELECT posts.*, blogs.name AS blog_name,
    //
    //    (SELECT COUNT(*)
    //      FROM reactions
    //      WHERE post_id = posts.id
    //        AND TYPE = 'post'
    //        AND post_id = posts.id
    //        AND like_status = 'Like' ) AS likes_count,
    //
    //     (SELECT COUNT(*)
    //      FROM reactions
    //      WHERE post_id = posts.id
    //        AND TYPE = 'post'
    //        AND post_id = posts.id
    //        AND like_status = 'Dislike' ) AS dislikes_count
    //
    //   FROM posts
    //   JOIN blogs ON blogs.id = posts.blog_id
    //   WHERE posts.id = $1;
    // `,
    //   [postId],
    // );

    const post = await this.postRepository
      .createQueryBuilder('posts')
      .select(['posts.*', 'blogs.name AS blog_name'])
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .where('reactions.post_id = posts.id')
          .andWhere('reactions.type = :type', { type: 'post' })
          .andWhere("reactions.like_status = 'Like'");
      }, 'likes_count')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .where('reactions.post_id = posts.id')
          .andWhere('reactions.type = :type', { type: 'post' })
          .andWhere("reactions.like_status = 'Dislike'");
      }, 'dislikes_count')
      .leftJoin(BlogEntity, 'blogs', `blogs.id = posts.blog_id`)
      .where('posts.id = :postId', { postId })
      .getRawOne();

    return post;
  }
}
