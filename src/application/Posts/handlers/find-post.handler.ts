import { PostViewModel } from '../interfaces';
import { PostsMapper } from '../../../common/mappers/posts.mapper';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class FindPostCommand {
  constructor(public postId: string, public userLogin = '') {}
}

@CommandHandler(FindPostCommand)
export class FindPostHandler {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
  ) {}

  public async execute({ postId, userLogin }: FindPostCommand): Promise<PostViewModel | null> {
    const post = await this.postsQueryRepository.findOne(postId);

    if (!post) {
      return null;
    }

    const lastReactions = await this.reactionsQueryRepository.findLatestReactionsForPost(post._id, 3);

    if (userLogin) {
      const user = await this.usersQueryRepository.findByLogin(userLogin);
      const reaction = await this.reactionsQueryRepository.findReactionById(post._id, user!._id, 'post');

      return PostsMapper.mapPostViewModel(post, reaction, lastReactions);
    }

    return PostsMapper.mapPostViewModel(post, null, lastReactions);
  }
}
