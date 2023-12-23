import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import ReactionEntity from '../../../db/entities/reaction.entity';

@Injectable()
export class ReactionsQueryRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ReactionEntity) private readonly reactionRepository: Repository<ReactionEntity>,
  ) {}

  public async findCommentReactionById(commentId: number, userId: number) {
    // return this.dataSource.query<ReactionEntity[]>(
    //   `
    //   SELECT * FROM reactions
    //   WHERE comment_id = $1 AND user_id = $2 AND type = 'comment'
    // `,
    //   [commentId, userId],
    // );

    return this.reactionRepository.findOne({ where: { comment_id: commentId, user_id: userId, type: 'comment' } });
  }

  public async getCountLikesAndDislikesForUser(type: 'comment' | 'post', id: number) {
    const res = await this.reactionRepository
      .createQueryBuilder('reactions')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .where(type === 'comment' ? 'reactions.comment_id = :id' : 'reactions.post_id = :id', { id })
          .andWhere('reactions.type = :type', { type })
          .andWhere("reactions.like_status = 'Like'");
      }, 'likes_count')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .where(type === 'comment' ? 'reactions.comment_id = :id' : 'reactions.post_id = :id', { id })
          .andWhere('reactions.type = :type', { type })
          .andWhere("reactions.like_status = 'Dislike'");
      }, 'dislikes_count')
      .getRawOne();

    return {
      likesCount: res?.likes_count ?? 0,
      dislikesCount: res?.dislikes_count ?? 0,
    };
  }

  public async findPostReactionById(postId: number, userId: number) {
    // return this.dataSource.query<ReactionEntity[]>(
    //   `
    //   SELECT * FROM reactions
    //   WHERE post_id = $1 AND user_id = $2 AND type = 'post'
    // `,
    //   [postId, userId],
    // );

    return this.reactionRepository.findOne({ where: { post_id: postId, user_id: userId, type: 'post' } });
  }

  public async findReactionsByIds(
    ids: (number | string)[],
    userId: number,
    type: 'comment' | 'post',
  ): Promise<ReactionEntity[]> {
    // return this.dataSource.query<ReactionEntity[]>(
    //   `
    //   SELECT reactions.*, users.login as user_login FROM reactions
    //   JOIN users ON users.id = reactions.user_id
    //   WHERE post_id = ANY($1) AND user_id = $2 AND type = $3
    // `,
    //   [ids, userId, type],
    // );

    return this.reactionRepository
      .createQueryBuilder('reactions')
      .select(['reactions.*', 'users.login AS user_login'])
      .leftJoin('users', 'users', 'users.id = reactions.user_id')
      .where(`${type === 'comment' ? 'reactions.comment_id' : 'reactions.post_id'} = ANY(:ids)`, { ids })
      .andWhere('reactions.user_id = :userId', { userId })
      .andWhere('reactions.type = :type', { type })
      .getRawMany();
  }

  public async findLatestReactionsForPost(postId: number, limit: number): Promise<ReactionEntity[]> {
    if (!postId || !Number.isInteger(+postId)) {
      return [];
    }

    // return this.dataSource.query<ReactionEntity[]>(
    //   `
    //   SELECT reactions.*, users.login as user_login FROM reactions
    //   JOIN users ON users.id = reactions.user_id
    //   WHERE post_id = $1 AND like_status = 'Like'
    //   ORDER BY reactions.created_at DESC
    //   LIMIT $2;
    // `,
    //   [postId, limit],
    // );

    return this.reactionRepository
      .createQueryBuilder('reactions')
      .select(['reactions.*', 'users.login AS user_login'])
      .leftJoin('users', 'users', 'users.id = reactions.user_id')
      .where('reactions.post_id = :postId', { postId })
      .andWhere('reactions.like_status = :likeStatus', { likeStatus: 'Like' })
      .orderBy('reactions.created_at', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
