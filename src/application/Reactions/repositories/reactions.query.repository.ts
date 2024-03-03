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
    return this.reactionRepository.findOne({
      where: { comment_id: commentId, user_id: userId, type: 'comment', user: { is_banned: false } },
    });
  }

  public async getCountLikesAndDislikesForUser(type: 'comment' | 'post', id: number) {
    const res = await this.reactionRepository
      .createQueryBuilder('reactions')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .leftJoin('users', 'users', 'users.id = reactions.user_id')
          .where(type === 'comment' ? 'reactions.comment_id = :id' : 'reactions.post_id = :id', { id })
          .andWhere('reactions.type = :type', { type })
          .andWhere("reactions.like_status = 'Like'")
          .andWhere('users.is_banned = :value', { value: false });
      }, 'likes_count')
      .addSelect((subQuery) => {
        return subQuery
          .addSelect('COUNT(*)')
          .from(ReactionEntity, 'reactions')
          .leftJoin('users', 'users', 'users.id = reactions.user_id')
          .where(type === 'comment' ? 'reactions.comment_id = :id' : 'reactions.post_id = :id', { id })
          .andWhere('reactions.type = :type', { type })
          .andWhere("reactions.like_status = 'Dislike'")
          .andWhere('users.is_banned = :value', { value: false });
      }, 'dislikes_count')
      .getRawOne();

    return {
      likesCount: res?.likes_count ?? 0,
      dislikesCount: res?.dislikes_count ?? 0,
    };
  }

  public async findPostReactionById(postId: number, userId: number) {
    return this.reactionRepository.findOne({
      where: { post_id: postId, user_id: userId, type: 'post', user: { is_banned: false } },
    });
  }

  public async findReactionsByIds(
    ids: (number | string)[],
    userId: number,
    type: 'comment' | 'post',
  ): Promise<ReactionEntity[]> {
    return this.reactionRepository
      .createQueryBuilder('reactions')
      .select(['reactions.*', 'users.login AS user_login'])
      .leftJoin('users', 'users', 'users.id = reactions.user_id')
      .where(`${type === 'comment' ? 'reactions.comment_id' : 'reactions.post_id'} = ANY(:ids)`, { ids })
      .andWhere('reactions.user_id = :userId', { userId })
      .andWhere('reactions.type = :type', { type })
      .andWhere('users.is_banned = :value', { value: false })
      .getRawMany();
  }

  public async findLatestReactionsForPost(postId: number, limit: number): Promise<ReactionEntity[]> {
    if (!postId || !Number.isInteger(+postId)) {
      return [];
    }

    return this.reactionRepository
      .createQueryBuilder('reactions')
      .select(['reactions.*', 'users.login AS user_login'])
      .leftJoin('users', 'users', 'users.id = reactions.user_id')
      .where('reactions.post_id = :postId', { postId })
      .andWhere('reactions.like_status = :likeStatus', { likeStatus: 'Like' })
      .andWhere('users.is_banned = :value', { value: false })
      .orderBy('reactions.created_at', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
