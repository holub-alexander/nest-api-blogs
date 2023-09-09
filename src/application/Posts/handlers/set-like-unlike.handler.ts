import { Reaction, ReactionDocument } from '../../../db/entities/mongoose/reaction.entity';
import { LikeStatuses } from '../../../common/interfaces';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostsTypeOrmQueryRepository } from '../repositories/typeorm/posts.query.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { PostsTypeOrmWriteRepository } from '../repositories/typeorm/posts.write.repository';
import { ReactionsTypeOrmQueryRepository } from '../../Reactions/repositories/typeorm/reactions.query.repository';
import { ReactionsTypeOrmWriteRepository } from '../../Reactions/repositories/typeorm/reactions.write.repository';
import ReactionEntityTypeOrm from '../../../db/entities/typeorm/reaction.entity';

export class SetLikeUnlikeForPostCommand {
  constructor(public postId: string, public login: string, public likeStatus: LikeStatuses) {}
}

@CommandHandler(SetLikeUnlikeForPostCommand)
export class SetLikeUnlikeForPostHandler {
  constructor(
    @InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>,
    private readonly postsQueryRepository: PostsTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
    private readonly postsWriteRepository: PostsTypeOrmWriteRepository,
    private readonly reactionsQueryRepository: ReactionsTypeOrmQueryRepository,
    private readonly reactionsWriteRepository: ReactionsTypeOrmWriteRepository,
  ) {}

  public async execute({
    likeStatus,
    postId,
    login,
  }: SetLikeUnlikeForPostCommand): Promise<ReactionEntityTypeOrm | null> {
    const post = await this.postsQueryRepository.findOne(postId);
    const user = await this.usersQueryRepository.findByLogin(login);

    if (!post || post.length === 0 || !user) {
      return null;
    }

    const reaction = await this.reactionsQueryRepository.findPostReactionById(post[0].id, user.id);

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
    newReaction.post_id = post[0].id;
    newReaction.comment_id = null;
    newReaction.user_id = user.id;
    newReaction.created_at = new Date();
    newReaction.like_status = likeStatus;

    await this.reactionsWriteRepository.create(newReaction);

    return newReaction;

    //
    // if (!reaction && likeStatus === LikeStatuses.NONE) {
    //   return null;
    // }
    //
    // if (reaction) {
    //   const res = await this.reactionsWriteRepository.updateLikeStatus(reaction._id, likeStatus);
    //
    //   if (res) {
    //     return reaction;
    //   }
    //
    //   return null;
    // }
    //
    // const reactionDTO = new this.ReactionModel<Reaction>({
    //   type: 'post',
    //   subjectId: post._id,
    //   user: {
    //     id: user._id,
    //     login: user.accountData.login,
    //     isBanned: false,
    //   },
    //   createdAt: new Date(),
    //   likeStatus,
    // });
    //
    // await this.reactionsWriteRepository.save(reactionDTO);
    //
    // return reactionDTO;
  }
}
