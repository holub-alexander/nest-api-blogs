import { ObjectId } from 'mongodb';
import { PaginationOptionsDto } from '../../../../common/dto/pagination-options.dto';
import { SortDirections } from '../../../../common/interfaces';
import { CommentDocument } from '../../../../db/entities/mongoose/comment.entity';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { PaginationMetaDto } from '../../../../common/dto/pagination-meta.dto';
import { getObjectToSort } from '../../../../common/utils/get-object-to-sort';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import CommentEntityTypeOrm from '../../../../db/entities/typeorm/comment.entity';

const allowedFieldForSorting = {
  id: 'id',
  content: 'content',
  userId: 'user_id',
  userLogin: 'user_login',
  createdAt: 'created_at',
};

@Injectable()
export class CommentsTypeOrmQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  public async findOne(commentId: string, userId: number | null): Promise<CommentEntityTypeOrm[] | null> {
    // const isValidId = ObjectId.isValid(commentId);
    //
    // if (isValidId) {
    //   return this.CommentModel.findOne<CommentDocument>({
    //     _id: new ObjectId(commentId),
    //     'commentatorInfo.isBanned': false,
    //     isBanned: false,
    //   });
    // }
    //
    // return null;

    if (!commentId || !Number.isInteger(+commentId)) {
      return null;
    }

    const params: (string | number)[] = [commentId];

    let mainSelect = `
       SELECT comments.*,
       users.login AS user_login,
       users.is_banned AS user_is_banned,
    `;

    let mainQuery = `
        (SELECT COUNT(*)
         FROM reactions
         JOIN users ON users.id = reactions.user_id
         WHERE comment_id = comments.id
           AND users.is_banned = FALSE
           AND TYPE = 'comment'
           AND comment_id = comments.id
           AND like_status = 'Like' ) AS likes_count,
      
        (SELECT COUNT(*)
         FROM reactions
         JOIN users ON users.id = reactions.user_id
         WHERE comment_id = comments.id
           AND users.is_banned = FALSE
           AND TYPE = 'comment'
           AND comment_id = comments.id
           AND like_status = 'Dislike' ) AS dislikes_count
           
      FROM comments
      JOIN users ON users.id = comments.user_id
      JOIN blogs ON blogs.id = comments.blog_id
    `;

    let mainWhere = `
      WHERE users.is_banned = FALSE
        AND blogs.is_banned = FALSE
        AND comments.id = $${params.length}
    `;

    if (userId) {
      mainSelect += 'banned_users.blog_id AS banned_user_blog_id,';
      params.push(userId);
      mainQuery += `LEFT JOIN banned_users_in_blogs AS banned_users ON banned_users.blog_id = comments.blog_id AND banned_users.user_id = $${params.length}`;
      mainWhere += `AND (banned_users.is_banned = FALSE OR banned_users.is_banned IS NULL);`;
    }

    return this.dataSource.query(mainSelect + mainQuery + mainWhere, params);
  }

  public async findAllWithPagination(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    postId: number,
    userId: number | null,
  ): Promise<PaginationDto<CommentEntityTypeOrm>> {
    // const sorting = getObjectToSort({ sortBy, sortDirection });
    // const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    // const filter = { postId: new mongoose.Types.ObjectId(postId), 'commentatorInfo.isBanned': false, isBanned: false };
    //
    // const totalCount = await this.CommentModel.countDocuments(filter);
    // const items = await this.CommentModel.find<CommentDocument>(filter)
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

    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const pageNumberFormat = (+pageNumber - 1) * +pageSizeValue;
    const queryParams: (number | null)[] = [pageSizeValue, pageNumberFormat, postId, userId];
    const totalQueryParams: (number | null)[] = [postId, userId];

    let query = `
      SELECT comments.*,
      users.login AS user_login,
      users.is_banned AS user_is_banned,
      banned_users.blog_id AS banned_user_blog_id,
      
      (SELECT COUNT(*)
         FROM reactions
         JOIN users ON users.id = reactions.user_id
         WHERE comment_id = comments.id
           AND users.is_banned = FALSE
           AND TYPE = 'comment'
           AND comment_id = comments.id
           AND like_status = 'Like' ) AS likes_count,
      
        (SELECT COUNT(*)
         FROM reactions
         JOIN users ON users.id = reactions.user_id
         WHERE comment_id = comments.id
           AND users.is_banned = FALSE
           AND TYPE = 'comment'
           AND comment_id = comments.id
           AND like_status = 'Dislike' ) AS dislikes_count,
           
        like_status
        
        FROM comments
        
        JOIN users ON users.id = comments.user_id
        JOIN blogs ON blogs.id = comments.blog_id
        LEFT JOIN reactions ON reactions.comment_id = comments.id AND reactions.user_id = $4
        LEFT JOIN banned_users_in_blogs AS banned_users ON banned_users.blog_id = comments.blog_id AND banned_users.user_id = comments.user_id
        
        WHERE users.is_banned = FALSE
          AND blogs.is_banned = FALSE
          AND comments.post_id = $3
          AND (banned_users.is_banned = FALSE OR banned_users.is_banned IS NULL)
    `;

    const totalCountQuery = `
      SELECT COUNT(*) FROM comments
      
      JOIN users ON users.id = comments.user_id
      JOIN blogs ON blogs.id = comments.blog_id
      LEFT JOIN reactions ON reactions.comment_id = comments.id AND reactions.user_id = $2
      LEFT JOIN banned_users_in_blogs AS banned_users ON banned_users.blog_id = comments.blog_id AND banned_users.user_id = comments.user_id
      
      WHERE users.is_banned = FALSE
        AND blogs.is_banned = FALSE
        AND comments.post_id = $1
        AND (banned_users.is_banned = FALSE OR banned_users.is_banned IS NULL)
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

  public async findAllByPostsIds(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    postsIds: ObjectId[],
    userId: ObjectId,
  ) {
    // @ts-ignore
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter = {
      postId: { $in: postsIds },
      'commentatorInfo.id': { $ne: userId },
      'commentatorInfo.isBanned': false,
      isBanned: false,
    };

    // @ts-ignore
    const totalCount = await this.CommentModel.countDocuments(filter);
    // @ts-ignore
    const items = await this.CommentModel.find<CommentDocument>(filter)
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount,
    });

    return new PaginationDto(items, paginationMetaDto);
  }
}
