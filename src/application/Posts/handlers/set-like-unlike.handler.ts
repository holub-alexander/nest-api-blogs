import { Reaction, ReactionDocument } from '../../../entity/reaction.entity';
import { LikeStatuses } from '../../../common/interfaces';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import { PostsWriteRepository } from '../repositories/posts.write.repository';
import { PostsQueryRepository } from '../repositories/posts.query.repository';

export class SetLikeUnlikeForPostCommand {
  constructor(public postId: string, public login: string, public likeStatus: LikeStatuses) {}
}

@CommandHandler(SetLikeUnlikeForPostCommand)
export class SetLikeUnlikeForPostHandler {
  constructor(
    @InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
  ) {}

  public async execute({ likeStatus, postId, login }: SetLikeUnlikeForPostCommand): Promise<ReactionDocument | null> {
    const post = await this.postsQueryRepository.findOne(postId);
    const user = await this.usersQueryRepository.findByLogin(login);

    if (!post || !user) {
      return null;
    }

    const reaction = await this.reactionsQueryRepository.findReactionById(post._id, user._id, 'post');

    if (!reaction && likeStatus === LikeStatuses.NONE) {
      return null;
    }

    if (reaction) {
      const res = await this.reactionsWriteRepository.updateLikeStatus(reaction._id, likeStatus);

      if (res) {
        return reaction;
      }

      return null;
    }

    const reactionDTO = new this.ReactionModel<Reaction>({
      type: 'post',
      subjectId: post._id,
      user: {
        id: user._id,
        login: user.accountData.login,
        isBanned: false,
      },
      createdAt: new Date(),
      likeStatus,
    });

    await this.reactionsWriteRepository.save(reactionDTO);

    return reactionDTO;
  }
}
