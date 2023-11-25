import { PostViewModel } from '../interfaces';
import { PostsMapper } from '../mappers/posts.mapper';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';

export class FindPostCommand {
  constructor(public postId: string, public userLogin = '') {}
}

@CommandHandler(FindPostCommand)
export class FindPostHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
  ) {}

  public async execute({ postId, userLogin }: FindPostCommand): Promise<PostViewModel | null> {
    const post = await this.postsQueryRepository.findOne(postId);

    if (!post) {
      return null;
    }

    const latestLikes = await this.reactionsQueryRepository.findLatestReactionsForPost(post.id, 3);

    if (userLogin) {
      const user = await this.usersQueryRepository.findByLogin(userLogin);

      if (!user) {
        return null;
      }

      const reaction = await this.reactionsQueryRepository.findPostReactionById(post.id, user.id);

      return PostsMapper.mapPostViewModel(post, reaction[0], latestLikes, post.likes_count, post.dislikes_count);
    } else {
      return PostsMapper.mapPostViewModel(post, null, latestLikes, post.likes_count, post.dislikes_count);
    }
  }
}
