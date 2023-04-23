import { ObjectId } from 'mongodb';
import { LikeStatuses } from '../../../common/interfaces';
import { Reaction, ReactionDocument } from '../../../entity/reaction.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { CommentsWriteRepository } from '../repositories/comments.write.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class SetLikeUnlikeForCommentCommand {
  constructor(public commentId: string, public login: string, public likeStatus: LikeStatuses) {}
}

@CommandHandler(SetLikeUnlikeForCommentCommand)
export class SetLikeUnlikeForCommentHandler {
  constructor(
    @InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
  ) {}

  private async incrementDecrementLikeCounter(
    commentId: ObjectId,
    userReactionType: LikeStatuses | null,
    likeStatus: LikeStatuses,
  ) {
    if (likeStatus === LikeStatuses.NONE && userReactionType !== LikeStatuses.NONE) {
      if (userReactionType === LikeStatuses.LIKE) {
        return this.commentsWriteRepository.likeCommentById(commentId, false);
      }

      return this.commentsWriteRepository.dislikeCommentById(commentId, false);
    }

    if (userReactionType === likeStatus) {
      return;
    }

    if (likeStatus === LikeStatuses.LIKE && userReactionType === LikeStatuses.DISLIKE) {
      await this.commentsWriteRepository.dislikeCommentById(commentId, false);
      return this.commentsWriteRepository.likeCommentById(commentId, true);
    }

    if (likeStatus === LikeStatuses.DISLIKE && userReactionType === LikeStatuses.LIKE) {
      await this.commentsWriteRepository.likeCommentById(commentId, false);
      return this.commentsWriteRepository.dislikeCommentById(commentId, true);
    }

    if (likeStatus === LikeStatuses.LIKE) {
      return this.commentsWriteRepository.likeCommentById(commentId, true);
    }

    if (likeStatus === LikeStatuses.DISLIKE) {
      return this.commentsWriteRepository.dislikeCommentById(commentId, true);
    }
  }

  public async execute({
    commentId,
    likeStatus,
    login,
  }: SetLikeUnlikeForCommentCommand): Promise<ReactionDocument | null> {
    const comment = await this.commentsQueryRepository.find(commentId);
    const user = await this.usersQueryRepository.findByLogin(login);

    console.log(comment, user);

    if (!comment || !user) {
      return null;
    }

    const reaction = await this.reactionsQueryRepository.findReactionById(comment._id, user._id, 'comment');

    if (!reaction && likeStatus === LikeStatuses.NONE) {
      return null;
    }

    if (reaction) {
      await this.incrementDecrementLikeCounter(comment._id, reaction.likeStatus, likeStatus);
      const res = await this.reactionsWriteRepository.updateLikeStatus(reaction._id, likeStatus);

      if (res) {
        return reaction;
      }

      return null;
    }

    const newReaction = new this.ReactionModel<Reaction>({
      type: 'comment',
      subjectId: comment._id,
      user: {
        id: user._id,
        login: user.accountData.login,
      },
      createdAt: new Date(),
      likeStatus,
    });

    await this.incrementDecrementLikeCounter(comment._id, null, likeStatus);
    await this.reactionsWriteRepository.save(newReaction);

    return newReaction;
  }
}
