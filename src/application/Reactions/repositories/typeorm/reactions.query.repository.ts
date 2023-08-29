import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Reaction, ReactionDocument } from '../../../../db/entities/mongoose/reaction.entity';
import { ObjectId } from 'mongodb';
import { LikeStatuses } from '../../../../common/interfaces';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import ReactionEntityTypeOrm from '../../../../db/entities/typeorm/reaction.entity';

@Injectable()
export class ReactionsTypeOrmQueryRepository {
  constructor(
    @InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>,
    private readonly dataSource: DataSource,
  ) {}

  public async findReactionById(id: ObjectId, userId: ObjectId, type: 'comment' | 'post') {
    return this.ReactionModel.findOne<ReactionDocument>({
      type,
      subjectId: id,
      'user.id': userId,
      'user.isBanned': false,
    });
  }

  public async findReactionsByIds(
    ids: ObjectId[],
    userId: ObjectId,
    type: 'comment' | 'post',
  ): Promise<ReactionDocument[]> {
    return this.ReactionModel.find<ReactionDocument>({
      type,
      'user.id': userId,
      'user.isBanned': false,
      subjectId: { $in: ids },
    });
  }

  public async findReactionsBySubjectId(type: 'post' | 'comment', subjectId: ObjectId): Promise<ReactionDocument[]> {
    return this.ReactionModel.find<ReactionDocument>({
      type,
      'user.isBanned': false,
      subjectId: subjectId,
    });
  }

  public async findLatestReactionsForPost(postId: number, limit: number): Promise<ReactionEntityTypeOrm[] | null> {
    // return this.ReactionModel.find({ subjectId: postId, likeStatus: LikeStatuses.LIKE, 'user.isBanned': false })
    //   .sort({ createdAt: 'desc' })
    //   .limit(limit);

    if (!postId || !Number.isInteger(+postId)) {
      return null;
    }

    return this.dataSource.query<ReactionEntityTypeOrm[]>(
      `
      SELECT * FROM reactions
      WHERE post_id = $1
      LIMIT $2;
    `,
      [postId, limit],
    );
  }
}
