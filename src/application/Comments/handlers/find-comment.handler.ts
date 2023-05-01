import { CommentViewModel } from '../interfaces';
import { CommentMapper } from '../mappers/comment.mapper';
import { InjectModel } from '@nestjs/mongoose';
import { Reaction, ReactionDocument } from '../../../entity/reaction.entity';
import { Model } from 'mongoose';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { FindAllLikesCommand } from '../../Reactions/handlers/find-all-likes.handler';

export class FindCommentCommand {
  constructor(public commentId: string, public userLogin: string | null) {}
}

@CommandHandler(FindCommentCommand)
export class FindCommentHandler {
  constructor(
    @InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>,
    private readonly commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
  ) {}

  public async execute(command: FindCommentCommand): Promise<CommentViewModel | null> {
    const comment = await this.commentsQueryRepository.find(command.commentId);

    if (!comment) {
      return null;
    }

    const { likesCount, dislikesCount } = await this.commandBus.execute(
      new FindAllLikesCommand('comment', comment._id),
    );

    if (command.userLogin) {
      const user = await this.usersQueryRepository.findByLogin(command.userLogin);
      const reaction = await this.reactionsQueryRepository.findReactionById(comment._id, user!._id, 'comment');

      return CommentMapper.mapCommentViewModel(comment, reaction, likesCount, dislikesCount);
    }

    return CommentMapper.mapCommentViewModel(comment, null, likesCount, dislikesCount);
  }
}
