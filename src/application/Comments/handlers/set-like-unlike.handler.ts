import { LikeStatuses } from '../../../common/interfaces';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { CommentsWriteRepository } from '../repositories/comments.write.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import ReactionEntity from '../../../db/entities/typeorm/reaction.entity';

export class SetLikeUnlikeForCommentCommand {
  constructor(public commentId: string, public login: string, public likeStatus: LikeStatuses) {}
}

@CommandHandler(SetLikeUnlikeForCommentCommand)
export class SetLikeUnlikeForCommentHandler {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
  ) {}

  public async execute({
    commentId,
    likeStatus,
    login,
  }: SetLikeUnlikeForCommentCommand): Promise<ReactionEntity | null> {
    const comment = await this.commentsQueryRepository.findOne(commentId, null);
    const user = await this.usersQueryRepository.findByLogin(login);

    if (!comment || !user) {
      return null;
    }

    const reaction = await this.reactionsQueryRepository.findCommentReactionById(comment.id, user.id);

    console.log('reaction', reaction);

    if (!reaction && likeStatus === LikeStatuses.NONE) {
      return null;
    }

    if (reaction) {
      const res = await this.reactionsWriteRepository.updateLikeStatus(reaction.id, likeStatus);

      if (res) {
        return reaction;
      }

      return null;
    }

    const newReaction = await this.reactionsWriteRepository.create();

    newReaction.type = 'comment';
    newReaction.post_id = null;
    newReaction.comment = comment;
    newReaction.user = user;
    newReaction.created_at = new Date();
    newReaction.like_status = likeStatus;

    await this.reactionsWriteRepository.save(newReaction);

    return newReaction;
  }
}
