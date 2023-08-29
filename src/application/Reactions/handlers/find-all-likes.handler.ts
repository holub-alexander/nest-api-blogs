// @ts-nocheck

import { CommandHandler } from '@nestjs/cqrs';
import { LikeStatuses } from '../../../common/interfaces';
import { ReactionsQueryRepository } from '../repositories/mongoose/reactions.query.repository';

export class FindAllLikesCommand {
  constructor(public type: 'comment' | 'post', public subjectId: number) {}
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
