import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { Paginator } from '../../../common/interfaces';
import { PostViewModel } from '../interfaces';
import { ObjectId } from 'mongodb';
import { Post, PostDocument } from '../../../db/entities/mongoose/post.entity';
import { Reaction, ReactionDocument } from '../../../db/entities/mongoose/reaction.entity';
import { PostsMapper } from '../mappers/posts.mapper';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../../db/entities/mongoose/comment.entity';
import { UsersQueryRepository } from '../../Users/repositories/mongoose/users.query.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/mongoose/reactions.query.repository';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { FindAllLikesCommand } from '../../Reactions/handlers/find-all-likes.handler';
import PostEntityTypeOrm from '../../../db/entities/typeorm/post.entity';
import ReactionEntityTypeOrm from '../../../db/entities/typeorm/reaction.entity';
import { PostsTypeOrmQueryRepository } from '../repositories/typeorm/posts.query.repository';
import { NotFoundException } from '@nestjs/common';

export class FindAllPostsByBlogIdCommand {
  constructor(public paginationOptions: PaginationOptionsDto, public id: string, public userLogin = '') {}
}

@CommandHandler(FindAllPostsByBlogIdCommand)
export class FindAllPostsByBlogIdHandler {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Comment.name) private readonly CommentModel: Model<CommentDocument>,
    @InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>,
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
  ) {}

  private formatPosts(items: PostEntityTypeOrm[], reactions: ReactionEntityTypeOrm[] | null): Promise<PostViewModel>[] {
    return items.map(async (post) => {
      // const lastReactions = await this.reactionsQueryRepository.findLatestReactionsForPost(post._id, 3);
      // const { likesCount, dislikesCount } = await this.commandBus.execute(new FindAllLikesCommand('post', post._id));
      //
      // if (!reactions || !lastReactions) {
      //   return PostsMapper.mapPostViewModel(post, null, lastReactions, likesCount, dislikesCount);
      // }
      //
      // const foundReactionIndex = reactions.findIndex(
      //   (reaction) => reaction.subjectId.toString() === post._id.toString(),
      // );
      //
      // if (foundReactionIndex > -1) {
      //   return PostsMapper.mapPostViewModel(
      //     post,
      //     reactions[foundReactionIndex],
      //     lastReactions,
      //     likesCount,
      //     dislikesCount,
      //   );
      // }

      return PostsMapper.mapPostViewModel(post, null, [], 0, 0);
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

    // if (userLogin) {
    //   const user = await this.usersQueryRepository.findByLogin(userLogin);
    //   const reactions = await this.reactionsQueryRepository.findReactionsByIds(
    //     items.map((post) => post._id),
    //     user!._id,
    //     'post',
    //   );
    //
    //   return {
    //     ...meta,
    //     items: await Promise.all(this.formatPosts(items, reactions)),
    //   };
    // }

    return {
      ...meta,
      items: await Promise.all(this.formatPosts(items, null)),
    };
  }
}
