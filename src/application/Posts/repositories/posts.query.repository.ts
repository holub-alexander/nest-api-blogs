import { Injectable } from '@nestjs/common';
import { SortDirections } from '../../../common/interfaces';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { Repository } from 'typeorm';
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
  constructor(@InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>) {}

  public async findAllWithPagination(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    blogId: number | null = null,
  ): Promise<PaginationDto<PostEntity>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;

    const totalCountQuery = await this.postRepository.createQueryBuilder('posts');
    const query = await this.postRepository.createQueryBuilder('posts');

    if (blogId) {
      totalCountQuery.where('blogs.id = :blogId', { blogId });
      query.where('blogs.id = :blogId', { blogId });
    }

    totalCountQuery
      .leftJoin(BlogEntity, 'blogs', 'blogs.id = posts.blog_id')
      .leftJoin('blogs.user', 'user')
      .andWhere('blogs.is_banned = :isBanned', { isBanned: false })
      .andWhere('user.is_banned = :value', { value: false });

    const totalCount = await totalCountQuery.getCount();

    const posts = await query
      .select(['posts.*', 'blogs.name AS blog_name'])
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .leftJoin('reactions.user', 'user')
          .where('reactions.post_id = posts.id')
          .andWhere('reactions.type = :type', { type: 'post' })
          .andWhere("reactions.like_status = 'Like'")
          .andWhere('user.is_banned = :value', { value: false });
      }, 'likes_count')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .leftJoin('reactions.user', 'user')
          .where('reactions.post_id = posts.id')
          .andWhere('reactions.type = :type', { type: 'post' })
          .andWhere("reactions.like_status = 'Dislike'")
          .andWhere('user.is_banned = :value', { value: false });
      }, 'dislikes_count')
      .leftJoin(BlogEntity, 'blogs', `blogs.id = posts.blog_id`)
      .leftJoin('blogs.user', 'user')
      .andWhere('blogs.is_banned = :isBanned', { isBanned: false })
      .andWhere('user.is_banned = :value', { value: false })
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

  public async findOne(postId: string) {
    if (!postId || !Number.isInteger(+postId)) {
      return null;
    }

    return this.postRepository
      .createQueryBuilder('posts')
      .select(['posts.*', 'blogs.name AS blog_name'])
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .leftJoin('reactions.user', 'user')
          .where('reactions.post_id = posts.id')
          .andWhere('reactions.type = :type', { type: 'post' })
          .andWhere("reactions.like_status = 'Like'")
          .andWhere('user.is_banned = :value', { value: false });
      }, 'likes_count')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .leftJoin('reactions.user', 'user')
          .where('reactions.post_id = posts.id')
          .andWhere('reactions.type = :type', { type: 'post' })
          .andWhere("reactions.like_status = 'Dislike'")
          .andWhere('user.is_banned = :value', { value: false });
      }, 'dislikes_count')
      .leftJoin(BlogEntity, 'blogs', `blogs.id = posts.blog_id`)
      .leftJoin('blogs.user', 'user')
      .where('posts.id = :postId', { postId })
      .andWhere('blogs.is_banned = :isBanned', { isBanned: false })
      .andWhere('user.is_banned = :value', { value: false })
      .getRawOne<PostEntity | null>();
  }
}
