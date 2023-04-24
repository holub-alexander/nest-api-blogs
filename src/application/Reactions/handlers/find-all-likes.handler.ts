import { CommandHandler } from '@nestjs/cqrs';
import { LikeStatuses } from '../../../common/interfaces';
import { ReactionsQueryRepository } from '../repositories/reactions.query.repository';
import { ObjectId } from 'mongodb';

export class FindAllLikesCommand {
  constructor(public type: 'comment' | 'post', public subjectId: ObjectId) {}
}

@CommandHandler(FindAllLikesCommand)
export class FindAllLikesHandler {
  constructor(private readonly reactionsQueryRepository: ReactionsQueryRepository) {}

  public async execute(command: FindAllLikesCommand) {
    const reactions = await this.reactionsQueryRepository.findReactionsBySubjectId(command.type, command.subjectId);
    const likesCount = reactions.filter((reaction) => reaction.likeStatus === LikeStatuses.LIKE).length;
    const dislikesCount = reactions.filter((reaction) => reaction.likeStatus === LikeStatuses.DISLIKE).length;

    return { likesCount, dislikesCount };
  }
}
