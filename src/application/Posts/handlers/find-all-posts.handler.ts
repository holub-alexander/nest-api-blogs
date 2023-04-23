import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { Paginator } from '../../../common/interfaces';
import { PostViewModel } from '../interfaces';
import { Post, PostDocument } from '../../../entity/post.entity';
import { Reaction, ReactionDocument } from '../../../entity/reaction.entity';
import { PostsMapper } from '../../../common/mappers/posts.mapper';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../../entity/comment.entity';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { PostsWriteRepository } from '../repositories/posts.write.repository';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { CommentsQueryRepository } from '../../Comments/repositories/comments.query.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/comments.write.repository';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class FindAllPostsCommand {
  constructor(public paginationQueryParams: PaginationOptionsDto, public userLogin = '') {}
}

@CommandHandler(FindAllPostsCommand)
export class FindAllPostsHandler {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Comment.name) private readonly CommentModel: Model<CommentDocument>,
    @InjectModel(Reaction.name) private readonly ReactionModel: Model<ReactionDocument>,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
  ) {}

  private formatPosts(items: PostDocument[], reactions: ReactionDocument[] | null): Promise<PostViewModel>[] {
    return items.map(async (post: PostDocument) => {
      const lastReactions = await this.reactionsQueryRepository.findLatestReactionsForPost(post._id, 3);

      if (!reactions || !lastReactions) {
        return PostsMapper.mapPostViewModel(post, null, lastReactions);
      }

      const foundReactionIndex = reactions.findIndex(
        (reaction) => reaction.subjectId.toString() === post._id.toString(),
      );

      if (foundReactionIndex > -1) {
        return PostsMapper.mapPostViewModel(post, reactions[foundReactionIndex], lastReactions);
      }

      return PostsMapper.mapPostViewModel(post, null, lastReactions);
    });
  }

  public async execute({ paginationQueryParams, userLogin }: FindAllPostsCommand): Promise<Paginator<PostViewModel[]>> {
    const { meta, items } = await this.postsQueryRepository.findAll(paginationQueryParams);

    if (userLogin) {
      const user = await this.usersQueryRepository.findByLogin(userLogin);
      const reactions = await this.reactionsQueryRepository.findReactionsByIds(
        items.map((post) => post._id),
        user!._id,
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
