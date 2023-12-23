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

    // const params: (string | number)[] = [commentId];
    //
    // const mainSelect = `
    //    SELECT comments.*,
    //    users.login AS user_login,
    // `;
    //
    // const mainQuery = `
    //     (SELECT COUNT(*)
    //      FROM reactions
    //      WHERE comment_id = comments.id
    //        AND TYPE = 'comment'
    //        AND comment_id = comments.id
    //        AND like_status = 'Like' ) AS likes_count,
    //
    //     (SELECT COUNT(*)
    //      FROM reactions
    //      WHERE comment_id = comments.id
    //        AND TYPE = 'comment'
    //        AND comment_id = comments.id
    //        AND like_status = 'Dislike' ) AS dislikes_count
    //
    //   FROM comments
    //   JOIN users ON users.id = comments.user_id
    //   JOIN blogs ON blogs.id = comments.blog_id
    // `;
    //
    // const mainWhere = `
    //   WHERE comments.id = $${params.length}
    // `;
    //
    // return this.dataSource.query(mainSelect + mainQuery + mainWhere, params);

    const comment = await this.commentRepository
      .createQueryBuilder('comments')
      .leftJoinAndSelect('comments.user', 'users')
      .leftJoinAndSelect('comments.blog', 'blogs')
      .leftJoinAndSelect('comments.post', 'posts')
      .where('comments.id = :commentId', { commentId })
      .getOne();

    return comment;
  }

  public async findAllWithPagination(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    postId: number,
    userId: number | null,
  ): Promise<PaginationDto<CommentEntity>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;
    // const queryParams: (number | null)[] = [pageSizeValue, pageNumberFormat, postId, userId];
    // const totalQueryParams: (number | null)[] = [postId, userId];
    //
    // let query = `
    //   SELECT comments.*,
    //   users.login AS user_login,
    //
    //   (SELECT COUNT(*)
    //      FROM reactions
    //      JOIN users ON users.id = reactions.user_id
    //      WHERE comment_id = comments.id
    //        AND TYPE = 'comment'
    //        AND comment_id = comments.id
    //        AND like_status = 'Like' ) AS likes_count,
    //
    //     (SELECT COUNT(*)
    //      FROM reactions
    //      JOIN users ON users.id = reactions.user_id
    //      WHERE comment_id = comments.id
    //        AND TYPE = 'comment'
    //        AND comment_id = comments.id
    //        AND like_status = 'Dislike' ) AS dislikes_count,
    //
    //     like_status
    //
    //     FROM comments
    //
    //     JOIN users ON users.id = comments.user_id
    //     JOIN blogs ON blogs.id = comments.blog_id
    //     LEFT JOIN reactions ON reactions.comment_id = comments.id AND reactions.user_id = $4
    //
    //     WHERE comments.post_id = $3
    // `;
    //
    // const totalCountQuery = `
    //   SELECT COUNT(*) FROM comments
    //
    //   JOIN users ON users.id = comments.user_id
    //   JOIN blogs ON blogs.id = comments.blog_id
    //   LEFT JOIN reactions ON reactions.comment_id = comments.id AND reactions.user_id = $2
    //
    //   WHERE comments.post_id = $1
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
    // const result = await this.dataSource.query<CommentEntity[]>(query, queryParams);
    //
    // const paginationMetaDto = new PaginationMetaDto({
    //   paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
    //   totalCount: +totalCount[0].count,
    // });
    //
    // return new PaginationDto(result, paginationMetaDto);

    const totalCountQuery = await this.commentRepository.createQueryBuilder('comments');
    const query = await this.commentRepository.createQueryBuilder('comments');

    totalCountQuery.where('comments.post_id = :postId', { postId });

    const totalCount = await totalCountQuery.getCount();

    const comments = await query
      .select(['comments.*', 'users.login AS user_login', 'reactions.like_status AS like_status'])
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .where('reactions.comment_id = comments.id')
          .andWhere('reactions.type = :type', { type: 'comment' })
          .andWhere("reactions.like_status = 'Like'");
      }, 'likes_count')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .where('reactions.comment_Id = comments.id')
          .andWhere('reactions.type = :type', { type: 'comment' })
          .andWhere("reactions.like_status = 'Dislike'");
      }, 'dislikes_count')
      .leftJoin('comments.user', 'users')
      .leftJoin('comments.blog', 'blogs')
      .leftJoin('comments.post', 'posts')
      .leftJoin(ReactionEntity, 'reactions', 'reactions.comment_id = comments.id AND reactions.user_id = :userId', {
        userId,
      })
      .where('comments.post_id = :postId', { postId })
      .orderBy(sorting.field, sorting.direction.toUpperCase() as 'ASC' | 'DESC')
      .offset(skippedItems)
      .limit(pageSizeValue)
      .getRawMany();

    console.log(comments[0]);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount,
    });

    return new PaginationDto(comments, paginationMetaDto);
  }
}
