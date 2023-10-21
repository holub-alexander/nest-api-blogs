import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import ReactionEntityTypeOrm from '../../../db/entities/typeorm/reaction.entity';

@Injectable()
export class ReactionsQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  public async findCommentReactionById(commentId: number, userId: number) {
    return this.dataSource.query<ReactionEntityTypeOrm[]>(
      `
      SELECT * FROM reactions
      WHERE comment_id = $1 AND user_id = $2 AND type = 'comment'
    `,
      [commentId, userId],
    );
  }

  public async findPostReactionById(postId: number, userId: number) {
    return this.dataSource.query<ReactionEntityTypeOrm[]>(
      `
      SELECT * FROM reactions
      WHERE post_id = $1 AND user_id = $2 AND type = 'post'
    `,
      [postId, userId],
    );
  }

  public async findReactionsByIds(
    ids: (number | string)[],
    userId: number,
    type: 'comment' | 'post',
  ): Promise<ReactionEntityTypeOrm[]> {
    return this.dataSource.query<ReactionEntityTypeOrm[]>(
      `
      SELECT reactions.*, users.login as user_login FROM reactions
      JOIN users ON users.id = reactions.user_id
      WHERE post_id = ANY($1) AND user_id = $2 AND type = $3
    `,
      [ids, userId, type],
    );
  }

  public async findLatestReactionsForPost(postId: number, limit: number): Promise<ReactionEntityTypeOrm[]> {
    if (!postId || !Number.isInteger(+postId)) {
      return [];
    }

    return this.dataSource.query<ReactionEntityTypeOrm[]>(
      `
      SELECT reactions.*, users.login as user_login FROM reactions
      JOIN users ON users.id = reactions.user_id
      WHERE post_id = $1 AND like_status = 'Like'
      ORDER BY reactions.created_at DESC
      LIMIT $2;
    `,
      [postId, limit],
    );
  }
}
