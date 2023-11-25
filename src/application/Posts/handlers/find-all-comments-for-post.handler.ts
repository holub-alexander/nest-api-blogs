import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { Paginator } from '../../../common/interfaces';
import { CommentViewModel } from '../../Comments/interfaces';
import { CommentMapper } from '../../Comments/mappers/comment.mapper';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { CommentsQueryRepository } from '../../Comments/repositories/comments.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';

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

    if (userLogin) {
      const user = await this.usersQueryRepository.findByLogin(userLogin);

      if (!user) {
        return null;
      }

      const { meta, items } = await this.commentsQueryRepository.findAllWithPagination(pagination, post.id, user.id);

      return {
        ...meta,
        items: CommentMapper.mapCommentsViewModel(items),
      };
    }

    const { meta, items } = await this.commentsQueryRepository.findAllWithPagination(pagination, post.id, null);

    return {
      ...meta,
      items: CommentMapper.mapCommentsViewModel(items),
    };
  }
}
