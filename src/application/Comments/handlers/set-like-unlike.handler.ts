import { LikeStatuses } from '../../../common/interfaces';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { CommentsWriteRepository } from '../repositories/comments.write.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import ReactionEntityTypeOrm from '../../../db/entities/typeorm/reaction.entity';

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
  }: SetLikeUnlikeForCommentCommand): Promise<ReactionEntityTypeOrm | null> {
    const comment = await this.commentsQueryRepository.findOne(commentId, null);
    const user = await this.usersQueryRepository.findByLogin(login);

    if (!comment || comment.length === 0 || !user) {
      return null;
    }

    const reaction = await this.reactionsQueryRepository.findCommentReactionById(comment[0].id, user.id);

    if ((!reaction || reaction.length === 0) && likeStatus === LikeStatuses.NONE) {
      return null;
    }

    if (reaction[0]) {
      const res = await this.reactionsWriteRepository.updateLikeStatus(reaction[0].id, likeStatus);

      if (res) {
        return reaction[0];
      }

      return null;
    }

    const newReaction = new ReactionEntityTypeOrm();

    newReaction.type = 'comment';
    newReaction.post_id = null;
    newReaction.comment_id = comment[0].id;
    newReaction.user_id = user.id;
    newReaction.created_at = new Date();
    newReaction.like_status = likeStatus;

    await this.reactionsWriteRepository.create(newReaction);

    return newReaction;
  }
}
