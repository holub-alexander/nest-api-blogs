import { ObjectId } from 'mongodb';
import { Reaction, ReactionDocument } from '../../../../db/entities/mongoose/reaction.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikeStatuses } from '../../../../common/interfaces';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReactionsTypeOrmWriteRepository {
  constructor(
    @InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(reaction: ReactionDocument): Promise<ReactionDocument> {
    return reaction.save();
  }

  public async updateLikeStatus(reactionId: ObjectId, likeStatus: LikeStatuses): Promise<boolean> {
    await this.ReactionModel.updateOne({ _id: reactionId }, { likeStatus });

    return true;
  }

  public async deleteMany(): Promise<boolean> {
    const result = await this.dataSource.query(`
      DELETE FROM reactions
      WHERE id > 0;
    `);

    return result[1] > 0;
  }

  public async updateUserBanStatus(userId: ObjectId, isBanned: boolean) {
    await this.ReactionModel.updateMany({ 'user.id': userId }, { 'user.isBanned': isBanned });
  }
}
