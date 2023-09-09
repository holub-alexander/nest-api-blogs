import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { Paginator } from '../../../common/interfaces';
import { CommentViewModel } from '../../Comments/interfaces';
import { CommentMapper } from '../../Comments/mappers/comment.mapper';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { FindAllLikesCommand } from '../../Reactions/handlers/find-all-likes.handler';
import { PostsTypeOrmQueryRepository } from '../repositories/typeorm/posts.query.repository';
import { CommentsTypeOrmQueryRepository } from '../../Comments/repositories/typeorm/comments.query.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { ReactionsTypeOrmQueryRepository } from '../../Reactions/repositories/typeorm/reactions.query.repository';

export class FindAllCommentsForPostCommand {
  constructor(public pagination: PaginationOptionsDto, public postId: string, public userLogin: string | null) {}
}

@CommandHandler(FindAllCommentsForPostCommand)
export class FindAllCommentsForPostHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsTypeOrmQueryRepository,
    private readonly commentsQueryRepository: CommentsTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
    private readonly reactionsQueryRepository: ReactionsTypeOrmQueryRepository,
  ) {}

  public async execute({
    pagination,
    postId,
    userLogin,
  }: FindAllCommentsForPostCommand): Promise<Paginator<CommentViewModel[]> | null> {
    const post = await this.postsQueryRepository.findOne(postId);

    if (!post || post.length === 0) {
      return null;
    }

    if (userLogin) {
      const user = await this.usersQueryRepository.findByLogin(userLogin);

      if (!user) {
        return null;
      }

      const { meta, items } = await this.commentsQueryRepository.findAllWithPagination(pagination, post[0].id, user.id);

      return {
        ...meta,
        items: CommentMapper.mapCommentsViewModel(items),
      };
    }

    const { meta, items } = await this.commentsQueryRepository.findAllWithPagination(pagination, post[0].id, null);

    return {
      ...meta,
      items: CommentMapper.mapCommentsViewModel(items),
    };

    // const subject = await Promise.all(
    //   items.map((reaction) => {
    //     return this.commandBus.execute(new FindAllLikesCommand('comment', reaction._id));
    //   }),
    // );
    //
    // if (userLogin) {
    //   const user = await this.usersQueryRepository.findByLogin(userLogin);
    //   const reactions = await this.reactionsQueryRepository.findReactionsByIds(
    //     items.map((comment) => comment._id),
    //     user!._id,
    //     'comment',
    //   );
    //
    //   return {
    //     ...meta,
    //     items: CommentMapper.mapCommentsViewModel(items, reactions, subject),
    //   };
    // }
    //
    // return {
    //   ...meta,
    //   items: CommentMapper.mapCommentsViewModel(items, null, subject),
    // };
  }
}
