import { LikeStatuses } from '../../../common/interfaces';
import { CommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { PostsWriteRepository } from '../repositories/posts.write.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import ReactionEntityTypeOrm from '../../../db/entities/typeorm/reaction.entity';

export class SetLikeUnlikeForPostCommand {
  constructor(public postId: string, public login: string, public likeStatus: LikeStatuses) {}
}

@CommandHandler(SetLikeUnlikeForPostCommand)
export class SetLikeUnlikeForPostHandler {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
  ) {}

  public async execute({
    likeStatus,
    postId,
    login,
  }: SetLikeUnlikeForPostCommand): Promise<ReactionEntityTypeOrm | null> {
    const post = await this.postsQueryRepository.findOne(postId);
    const user = await this.usersQueryRepository.findByLogin(login);

    if (!post || !user) {
      return null;
    }

    const reaction = await this.reactionsQueryRepository.findPostReactionById(post.id, user.id);

    if ((!reaction || reaction.length === 0) && likeStatus === LikeStatuses.NONE) {
      return null;
    }

    if (reaction[0]) {
      const res = await this.reactionsWriteRepository.updateLikeStatus(reaction[0].id, likeStatus);

      if (res) {
        return reaction[0];
      }

      return null;
    }

    const newReaction = new ReactionEntityTypeOrm();

    newReaction.type = 'post';
    newReaction.post_id = post.id;
    newReaction.comment_id = null;
    newReaction.user_id = user.id;
    newReaction.created_at = new Date();
    newReaction.like_status = likeStatus;

    await this.reactionsWriteRepository.create(newReaction);

    return newReaction;
  }
}
