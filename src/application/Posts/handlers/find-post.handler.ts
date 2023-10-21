import { PostViewModel } from '../interfaces';
import { PostsMapper } from '../mappers/posts.mapper';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { PostsTypeOrmQueryRepository } from '../repositories/typeorm/posts.query.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { ReactionsTypeOrmQueryRepository } from '../../Reactions/repositories/typeorm/reactions.query.repository';

export class FindPostCommand {
  constructor(public postId: string, public userLogin = '') {}
}

@CommandHandler(FindPostCommand)
export class FindPostHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
    private readonly reactionsQueryRepository: ReactionsTypeOrmQueryRepository,
  ) {}

  public async execute({ postId, userLogin }: FindPostCommand): Promise<PostViewModel | null> {
    const post = await this.postsQueryRepository.findOne(postId);

    if (!post || post.length === 0) {
      return null;
    }

    const latestLikes = await this.reactionsQueryRepository.findLatestReactionsForPost(post[0].id, 3);

    if (userLogin) {
      const user = await this.usersQueryRepository.findByLogin(userLogin);

      if (!user) {
        return null;
      }

      const reaction = await this.reactionsQueryRepository.findPostReactionById(post[0].id, user.id);

      return PostsMapper.mapPostViewModel(
        post[0],
        reaction[0],
        latestLikes,
        post[0].likes_count,
        post[0].dislikes_count,
      );
    } else {
      return PostsMapper.mapPostViewModel(post[0], null, latestLikes, post[0].likes_count, post[0].dislikes_count);
    }

    // console.log('POST', post);
    // const lastReactions = await this.reactionsQueryRepository.findLatestReactionsForPost(post._id, 3);
    // const { likesCount, dislikesCount } = await this.commandBus.execute(new FindAllLikesCommand('post', post._id));

    // if (userLogin) {
    //   const user = await this.usersQueryRepository.findByLogin(userLogin);
    //   const reaction = await this.reactionsQueryRepository.findReactionById(post._id, user!._id, 'post');
    //
    //   return PostsMapper.mapPostViewModel(post, reaction, lastReactions, likesCount, dislikesCount);
    // }

    // return PostsMapper.mapPostViewModel(post[0], null, lastReactions, likesCount, dislikesCount);
  }
}
