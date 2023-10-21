import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { SortDirections } from '../../../common/interfaces';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import CommentEntityTypeOrm from '../../../db/entities/typeorm/comment.entity';

const allowedFieldForSorting = {
  id: 'id',
  content: 'content',
  userId: 'user_id',
  userLogin: 'user_login',
  createdAt: 'created_at',
};

@Injectable()
export class CommentsQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  public async findOne(commentId: string, userId: number | null): Promise<CommentEntityTypeOrm[] | null> {
    if (!commentId || !Number.isInteger(+commentId)) {
      return null;
    }

    const params: (string | number)[] = [commentId];

    const mainSelect = `
       SELECT comments.*,
       users.login AS user_login,
    `;

    const mainQuery = `
        (SELECT COUNT(*)
         FROM reactions
         WHERE comment_id = comments.id
           AND TYPE = 'comment'
           AND comment_id = comments.id
           AND like_status = 'Like' ) AS likes_count,
      
        (SELECT COUNT(*)
         FROM reactions
         WHERE comment_id = comments.id
           AND TYPE = 'comment'
           AND comment_id = comments.id
           AND like_status = 'Dislike' ) AS dislikes_count
           
      FROM comments
      JOIN users ON users.id = comments.user_id
      JOIN blogs ON blogs.id = comments.blog_id
    `;

    const mainWhere = `
      WHERE comments.id = $${params.length}
    `;

    return this.dataSource.query(mainSelect + mainQuery + mainWhere, params);
  }

  public async findAllWithPagination(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    postId: number,
    userId: number | null,
  ): Promise<PaginationDto<CommentEntityTypeOrm>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const pageNumberFormat = (+pageNumber - 1) * +pageSizeValue;
    const queryParams: (number | null)[] = [pageSizeValue, pageNumberFormat, postId, userId];
    const totalQueryParams: (number | null)[] = [postId, userId];

    let query = `
      SELECT comments.*,
      users.login AS user_login,
      
      (SELECT COUNT(*)
         FROM reactions
         JOIN users ON users.id = reactions.user_id
         WHERE comment_id = comments.id
           AND TYPE = 'comment'
           AND comment_id = comments.id
           AND like_status = 'Like' ) AS likes_count,
      
        (SELECT COUNT(*)
         FROM reactions
         JOIN users ON users.id = reactions.user_id
         WHERE comment_id = comments.id
           AND TYPE = 'comment'
           AND comment_id = comments.id
           AND like_status = 'Dislike' ) AS dislikes_count,
           
        like_status
        
        FROM comments
        
        JOIN users ON users.id = comments.user_id
        JOIN blogs ON blogs.id = comments.blog_id
        LEFT JOIN reactions ON reactions.comment_id = comments.id AND reactions.user_id = $4
        
        WHERE comments.post_id = $3
    `;

    const totalCountQuery = `
      SELECT COUNT(*) FROM comments
      
      JOIN users ON users.id = comments.user_id
      JOIN blogs ON blogs.id = comments.blog_id
      LEFT JOIN reactions ON reactions.comment_id = comments.id AND reactions.user_id = $2
      
      WHERE comments.post_id = $1
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

    const result = await this.dataSource.query<CommentEntityTypeOrm[]>(query, queryParams);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount[0].count,
    });

    return new PaginationDto(result, paginationMetaDto);
  }
}
