import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { SortDirections } from '../../../common/interfaces';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import CommentEntity from '../../../db/entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import ReactionEntity from '../../../db/entities/reaction.entity';

const allowedFieldForSorting = {
  id: 'id',
  content: 'content',
  userId: 'user_id',
  userLogin: 'user_login',
  createdAt: 'created_at',
};

@Injectable()
export class CommentsQueryRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  public async findOne(commentId: string, userId: number | null): Promise<CommentEntity | null> {
    if (!commentId || !Number.isInteger(+commentId)) {
      return null;
    }

    return this.commentRepository
      .createQueryBuilder('comments')
      .leftJoinAndSelect('comments.user', 'users')
      .leftJoinAndSelect('comments.blog', 'blogs')
      .leftJoinAndSelect('comments.post', 'posts')
      .where('comments.id = :commentId', { commentId })
      .andWhere('users.is_banned = :value', { value: false })
      .andWhere('blogs.is_banned = :isBanned', { isBanned: false })
      .getOne();
  }

  public async findAllWithPagination(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    { postId, userId, bloggerId }: { postId?: number; bloggerId?: number | null; userId?: number | null },
  ): Promise<PaginationDto<CommentEntity>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;

    const totalCountQuery = await this.commentRepository.createQueryBuilder('comments');
    const query = await this.commentRepository.createQueryBuilder('comments');

    totalCountQuery
      .leftJoin('comments.user', 'users')
      .leftJoin('comments.blog', 'blogs')
      .where('blogs.is_banned = :isBanned', { isBanned: false })
      .andWhere('users.is_banned = :value', { value: false });

    if (postId) {
      totalCountQuery.andWhere('comments.post_id = :postId', { postId });
    }

    if (bloggerId) {
      totalCountQuery.andWhere('blogs.user_id = :userId', { userId: bloggerId });
    }

    const totalCount = await totalCountQuery.getCount();

    query
      .select(['comments.*', 'users.login AS user_login', 'reactions.like_status AS like_status'])
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .leftJoin('reactions.user', 'user')
          .where('reactions.comment_id = comments.id')
          .andWhere('reactions.type = :type', { type: 'comment' })
          .andWhere("reactions.like_status = 'Like'")
          .andWhere('user.is_banned = :value', { value: false });
      }, 'likes_count')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .leftJoin('reactions.user', 'user')
          .where('reactions.comment_Id = comments.id')
          .andWhere('reactions.type = :type', { type: 'comment' })
          .andWhere("reactions.like_status = 'Dislike'")
          .andWhere('user.is_banned = :value', { value: false });
      }, 'dislikes_count')
      .leftJoin('comments.user', 'users')
      .leftJoinAndSelect('comments.blog', 'blogs')
      .leftJoinAndSelect('comments.post', 'posts')
      .where('blogs.is_banned = :isBanned', { isBanned: false });

    if (postId) {
      query.andWhere('comments.post_id = :postId', { postId });
    }

    if (bloggerId) {
      query
        .leftJoin(ReactionEntity, 'reactions', 'reactions.comment_id = comments.id')
        .andWhere('blogs.user_id = :userId', { userId: bloggerId });
    } else {
      query.leftJoin(
        ReactionEntity,
        'reactions',
        'reactions.comment_id = comments.id AND reactions.user_id = :userId',
        {
          userId,
        },
      );
    }

    const comments = await query
      .andWhere('users.is_banned = :value', { value: false })
      .orderBy(sorting.field, sorting.direction.toUpperCase() as 'ASC' | 'DESC')
      .offset(skippedItems)
      .limit(pageSizeValue)
      .getRawMany();

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount,
    });

    return new PaginationDto(comments, paginationMetaDto);
  }
}
