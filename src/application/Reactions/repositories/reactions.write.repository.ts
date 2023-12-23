import { LikeStatuses } from '../../../common/interfaces';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import ReactionEntity from '../../../db/entities/reaction.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReactionsWriteRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ReactionEntity) private readonly reactionRepository: Repository<ReactionEntity>,
  ) {}

  public async create() {
    return this.reactionRepository.create();
  }

  public async save(reaction: ReactionEntity): Promise<ReactionEntity | null> {
    // const result = await this.dataSource.query(
    //   `
    //   INSERT INTO reactions (
    //     type, comment_id, post_id, user_id, created_at, like_status
    //   )
    //   VALUES ($1, $2, $3, $4, $5, $6)
    //   RETURNING *;
    // `,
    //   [
    //     reaction.type,
    //     reaction.comment_id,
    //     reaction.post_id,
    //     reaction.user_id,
    //     reaction.created_at,
    //     reaction.like_status,
    //   ],
    // );
    //
    // return result[0] || null;

    return this.reactionRepository.save(reaction);
  }

  public async updateLikeStatus(reactionId: number, likeStatus: LikeStatuses): Promise<boolean> {
    // const res = await this.dataSource.query<[ReactionEntity[], number]>(
    //   `
    //   UPDATE reactions
    //   SET like_status = $2
    //   WHERE id = $1;
    // `,
    //   [reactionId, likeStatus],
    // );
    //
    // return res[1] > 0;

    const res = await this.reactionRepository.update({ id: reactionId }, { like_status: likeStatus });

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteMany(): Promise<boolean> {
    // const result = await this.dataSource.query(`
    //   DELETE FROM reactions
    //   WHERE id > 0;
    // `);
    //
    // return result[1] > 0;

    const res = await this.reactionRepository.delete({});

    return !res.affected ? false : res.affected > 0;
  }
}
