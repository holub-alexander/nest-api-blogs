import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { Paginator } from '../../../common/interfaces';
import { PostViewModel } from '../interfaces';
import { PostsMapper } from '../mappers/posts.mapper';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import PostEntity from '../../../db/entities/typeorm/post.entity';
import ReactionEntity from '../../../db/entities/typeorm/reaction.entity';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';

export class FindAllPostsCommand {
  constructor(public paginationQueryParams: PaginationOptionsDto, public userLogin = '') {}
}

@CommandHandler(FindAllPostsCommand)
export class FindAllPostsHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
  ) {}

  private formatPosts(items: PostEntity[], reactions: ReactionEntity[] | null): Promise<PostViewModel>[] {
    return items.map(async (post) => {
      const lastReactions = await this.reactionsQueryRepository.findLatestReactionsForPost(post.id, 3);

      if (!reactions || !lastReactions) {
        return PostsMapper.mapPostViewModel(post, null, lastReactions, post.likes_count, post.dislikes_count);
      }

      const foundReactionIndex = reactions.findIndex(
        (reaction) => reaction?.post_id?.toString() === post.id.toString(),
      );

      if (foundReactionIndex > -1) {
        return PostsMapper.mapPostViewModel(
          post,
          reactions[foundReactionIndex],
          lastReactions,
          post.likes_count,
          post.dislikes_count,
        );
      }

      return PostsMapper.mapPostViewModel(post, null, lastReactions, post.likes_count, post.dislikes_count);
    });
  }

  public async execute({ paginationQueryParams, userLogin }: FindAllPostsCommand): Promise<Paginator<PostViewModel[]>> {
    const { meta, items } = await this.postsQueryRepository.findAllWithPagination(paginationQueryParams);

    if (userLogin) {
      const user = await this.usersQueryRepository.findByLogin(userLogin);

      if (!user) {
        return {
          ...meta,
          items: await Promise.all(this.formatPosts(items, null)),
        };
      }

      const reactions = await this.reactionsQueryRepository.findReactionsByIds(
        items.map((post) => post.id),
        user.id,
        'post',
      );

      return {
        ...meta,
        items: await Promise.all(this.formatPosts(items, reactions)),
      };
    }

    return {
      ...meta,
      items: await Promise.all(this.formatPosts(items, null)),
    };
  }
}
