import { CommentViewModel } from '../interfaces';
import { CommentMapper } from '../mappers/comment.mapper';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';

export class FindCommentCommand {
  constructor(public commentId: string, public userLogin: string | null) {}
}

@CommandHandler(FindCommentCommand)
export class FindCommentHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
  ) {}

  public async execute(command: FindCommentCommand): Promise<CommentViewModel | null> {
    if (command.userLogin) {
      const user = await this.usersQueryRepository.findByLogin(command.userLogin);

      if (!user) {
        return null;
      }

      const comment = await this.commentsQueryRepository.findOne(command.commentId, user.id);

      console.log(comment);

      if (!comment) {
        return null;
      }

      const reaction = await this.reactionsQueryRepository.findCommentReactionById(comment.id, user.id);
      const { likesCount, dislikesCount } = await this.reactionsQueryRepository.getCountLikesAndDislikesForUser(
        'comment',
        comment.id,
      );

      console.log(likesCount, dislikesCount);

      return CommentMapper.mapCommentViewModel(comment, reaction, likesCount, dislikesCount);
    } else {
      const comment = await this.commentsQueryRepository.findOne(command.commentId, null);

      if (!comment) {
        return null;
      }

      const { likesCount, dislikesCount } = await this.reactionsQueryRepository.getCountLikesAndDislikesForUser(
        'comment',
        comment.id,
      );

      return CommentMapper.mapCommentViewModel(comment, null, likesCount, dislikesCount);
    }
  }
}
