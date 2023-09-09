import { CommentViewModel } from '../interfaces';
import { CommentMapper } from '../mappers/comment.mapper';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { FindAllLikesCommand } from '../../Reactions/handlers/find-all-likes.handler';
import { CommentsTypeOrmQueryRepository } from '../repositories/typeorm/comments.query.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { ReactionsTypeOrmQueryRepository } from '../../Reactions/repositories/typeorm/reactions.query.repository';

export class FindCommentCommand {
  constructor(public commentId: string, public userLogin: string | null) {}
}

@CommandHandler(FindCommentCommand)
export class FindCommentHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
    private readonly reactionsQueryRepository: ReactionsTypeOrmQueryRepository,
  ) {}

  public async execute(command: FindCommentCommand): Promise<CommentViewModel | null> {
    console.log('command.userLogin', command.userLogin);

    if (command.userLogin) {
      const user = await this.usersQueryRepository.findByLogin(command.userLogin);

      if (!user) {
        return null;
      }

      const comment = await this.commentsQueryRepository.findOne(command.commentId, user.id);

      if (!comment || comment.length === 0) {
        return null;
      }

      const reaction = await this.reactionsQueryRepository.findCommentReactionById(comment[0].id, user.id);

      return CommentMapper.mapCommentViewModel(
        comment[0],
        reaction[0],
        comment[0].likes_count,
        comment[0].dislikes_count,
      );
    } else {
      const comment = await this.commentsQueryRepository.findOne(command.commentId, null);

      console.log('comment', comment);

      if (!comment || comment.length === 0) {
        return null;
      }

      return CommentMapper.mapCommentViewModel(comment[0], null, comment[0].likes_count, comment[0].dislikes_count);
    }

    // const { likesCount, dislikesCount } = await this.commandBus.execute(
    //   new FindAllLikesCommand('comment', comment._id),
    // );
    //
    // if (command.userLogin) {
    //   const user = await this.usersQueryRepository.findByLogin(command.userLogin);
    //   const reaction = await this.reactionsQueryRepository.findReactionById(comment._id, user!._id, 'comment');
    //
    //   return CommentMapper.mapCommentViewModel(comment, reaction, likesCount, dislikesCount);
    // }
  }
}
