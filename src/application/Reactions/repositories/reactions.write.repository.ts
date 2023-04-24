import { ObjectId } from 'mongodb';
import { Reaction, ReactionDocument } from '../../../entity/reaction.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikeStatuses } from '../../../common/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReactionsWriteRepository {
  constructor(@InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>) {}

  public async save(reaction: ReactionDocument): Promise<ReactionDocument> {
    return reaction.save();
  }

  public async updateLikeStatus(reactionId: ObjectId, likeStatus: LikeStatuses): Promise<boolean> {
    await this.ReactionModel.updateOne({ _id: reactionId }, { likeStatus });

    return true;
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.ReactionModel.deleteMany({});
    return res.deletedCount > 0;
  }

  public async updateUserBanStatus(userId: ObjectId, isBanned: boolean) {
    await this.ReactionModel.updateMany({ 'user.id': userId }, { 'user.isBanned': isBanned });
  }
}
