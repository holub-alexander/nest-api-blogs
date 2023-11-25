import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { Paginator } from '../../../common/interfaces';
import { PostViewModel } from '../interfaces';
import { PostsMapper } from '../mappers/posts.mapper';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import PostEntity from '../../../db/entities/typeorm/post.entity';
import ReactionEntityTypeOrm from '../../../db/entities/typeorm/reaction.entity';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { NotFoundException } from '@nestjs/common';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';

export class FindAllPostsByBlogIdCommand {
  constructor(public paginationOptions: PaginationOptionsDto, public id: string, public userLogin = '') {}
}

@CommandHandler(FindAllPostsByBlogIdCommand)
export class FindAllPostsByBlogIdHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
  ) {}

  private formatPosts(items: PostEntity[], reactions: ReactionEntityTypeOrm[] | null): Promise<PostViewModel>[] {
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

  public async execute({
    userLogin,
    paginationOptions,
    id,
  }: FindAllPostsByBlogIdCommand): Promise<Paginator<PostViewModel[]>> {
    if (!id || !Number.isInteger(+id)) {
      throw new NotFoundException();
    }

    const { meta, items } = await this.postsQueryRepository.findAllByBlogId(paginationOptions, +id);

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
