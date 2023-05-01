import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { Paginator } from '../../../common/interfaces';
import { CommentViewModel } from '../../Comments/interfaces';
import { CommentMapper } from '../../Comments/mappers/comment.mapper';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { CommentsQueryRepository } from '../../Comments/repositories/comments.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { FindAllLikesCommand } from '../../Reactions/handlers/find-all-likes.handler';

export class FindAllCommentsForPostCommand {
  constructor(public pagination: PaginationOptionsDto, public postId: string, public userLogin: string | null) {}
}

@CommandHandler(FindAllCommentsForPostCommand)
export class FindAllCommentsForPostHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
  ) {}

  public async execute({
    pagination,
    postId,
    userLogin,
  }: FindAllCommentsForPostCommand): Promise<Paginator<CommentViewModel[]> | null> {
    const post = await this.postsQueryRepository.findOne(postId);

    if (!post) {
      return null;
    }

    const { meta, items } = await this.commentsQueryRepository.findAllWithPagination(pagination, postId);

    const subject = await Promise.all(
      items.map((reaction) => {
        return this.commandBus.execute(new FindAllLikesCommand('comment', reaction._id));
      }),
    );

    if (userLogin) {
      const user = await this.usersQueryRepository.findByLogin(userLogin);
      const reactions = await this.reactionsQueryRepository.findReactionsByIds(
        items.map((comment) => comment._id),
        user!._id,
        'comment',
      );

      return {
        ...meta,
        items: CommentMapper.mapCommentsViewModel(items, reactions, subject),
      };
    }

    return {
      ...meta,
      items: CommentMapper.mapCommentsViewModel(items, null, subject),
    };
  }
}
