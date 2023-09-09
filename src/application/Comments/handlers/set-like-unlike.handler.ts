import { LikeStatuses } from '../../../common/interfaces';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentsTypeOrmQueryRepository } from '../repositories/typeorm/comments.query.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { CommentsTypeOrmWriteRepository } from '../repositories/typeorm/comments.write.repository';
import { ReactionsTypeOrmQueryRepository } from '../../Reactions/repositories/typeorm/reactions.query.repository';
import { ReactionsTypeOrmWriteRepository } from '../../Reactions/repositories/typeorm/reactions.write.repository';
import ReactionEntityTypeOrm from '../../../db/entities/typeorm/reaction.entity';

export class SetLikeUnlikeForCommentCommand {
  constructor(public commentId: string, public login: string, public likeStatus: LikeStatuses) {}
}

@CommandHandler(SetLikeUnlikeForCommentCommand)
export class SetLikeUnlikeForCommentHandler {
  constructor(
    private readonly commentsQueryRepository: CommentsTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
    private readonly commentsWriteRepository: CommentsTypeOrmWriteRepository,
    private readonly reactionsQueryRepository: ReactionsTypeOrmQueryRepository,
    private readonly reactionsWriteRepository: ReactionsTypeOrmWriteRepository,
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

    // const newReaction = new this.ReactionModel<Reaction>({
    //   type: 'comment',
    //   subjectId: comment._id,
    //   user: {
    //     id: user._id,
    //     login: user.accountData.login,
    //     isBanned: false,
    //   },
    //   createdAt: new Date(),
    //   likeStatus,
    // });
    //
    // await this.reactionsWriteRepository.save(newReaction);

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
