import { ObjectId } from 'mongodb';
import { Reaction, ReactionDocument } from '../../../../db/entities/mongoose/reaction.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikeStatuses } from '../../../../common/interfaces';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import ReactionEntityTypeOrm from '../../../../db/entities/typeorm/reaction.entity';

@Injectable()
export class ReactionsTypeOrmWriteRepository {
  constructor(
    @InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>,
    private readonly dataSource: DataSource,
  ) {}

  // public async save(reaction: ReactionDocument): Promise<ReactionDocument> {
  //   return reaction.save();
  // }

  public async create(reaction: ReactionEntityTypeOrm): Promise<ReactionEntityTypeOrm | null> {
    const result = await this.dataSource.query(
      `
      INSERT INTO reactions (
        type, comment_id, post_id, user_id, created_at, like_status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
      [
        reaction.type,
        reaction.comment_id,
        reaction.post_id,
        reaction.user_id,
        reaction.created_at,
        reaction.like_status,
      ],
    );

    return result[0] || null;
  }

  public async updateLikeStatus(reactionId: number, likeStatus: LikeStatuses): Promise<boolean> {
    // await this.ReactionModel.updateOne({ _id: reactionId }, { likeStatus });
    //
    // return true;

    const res = await this.dataSource.query<[ReactionEntityTypeOrm[], number]>(
      `
      UPDATE reactions
      SET like_status = $2
      WHERE id = $1;
    `,
      [reactionId, likeStatus],
    );

    return res[1] > 0;
  }

  public async deleteMany(): Promise<boolean> {
    const result = await this.dataSource.query(`
      DELETE FROM reactions
      WHERE id > 0;
    `);

    return result[1] > 0;
  }

  // public async updateUserBanStatus(userId: ObjectId, isBanned: boolean) {
  //   await this.ReactionModel.updateMany({ 'user.id': userId }, { 'user.isBanned': isBanned });
  // }
}
