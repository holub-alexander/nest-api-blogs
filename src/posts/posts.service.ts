import { PostViewModel } from './interfaces';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../blogs/repositories/blogs.query.repository';
import { PostsMapper } from '../common/mappers/posts.mapper';
import { CreatePostDto } from './dto/create.dto';
import { PostsWriteRepository } from './repositories/posts.write.repository';
import { PostsQueryRepository } from './repositories/posts.query.repository';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { LikeStatuses, Paginator } from '../common/interfaces';
import { Post, PostDocument } from '../entity/post.entity';
import { CreateCommentForPostDto } from '../comments/dto/create.dto';
import { CommentViewModel } from '../comments/interfaces';
import { UsersQueryRepository } from '../users/repositories/users.query.repository';
import { Comment, CommentDocument } from '../entity/comment.entity';
import { CommentsWriteRepository } from '../comments/repositories/comments.write.repository';
import { CommentMapper } from '../common/mappers/comment.mapper';
import { CommentsQueryRepository } from '../comments/repositories/comments.query.repository';
import { ReactionsQueryRepository } from '../reactions/repositories/reactions.query.repository';
import { Reaction, ReactionDocument } from '../entity/reaction.entity';
import { ReactionsWriteRepository } from '../reactions/repositories/reactions.write.repository';

@Injectable()
export class PostsService {
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
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
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

  public async findAll(
    paginationQueryParams: PaginationOptionsDto,
    userLogin = '',
  ): Promise<Paginator<PostViewModel[]>> {
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

  public async findAllByBlogId(
    paginationOptions: PaginationOptionsDto,
    id: string,
    userLogin = '',
  ): Promise<Paginator<PostViewModel[]>> {
    const formatId = new ObjectId(id);
    const { meta, items } = await this.postsQueryRepository.findAllByBlogId(paginationOptions, formatId);

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

  public async findOne(postId: string, userLogin = ''): Promise<PostViewModel | null> {
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

  public async create(body: CreatePostDto): Promise<PostViewModel | null> {
    const findBlog = await this.blogsQueryRepository.findOne(body.blogId);

    if (findBlog) {
      const doc: PostDocument = new this.PostModel<Post>({
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        createdAt: new Date(),
        blog: {
          id: findBlog._id,
          name: findBlog.name,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
      });

      await this.postsWriteRepository.save(doc);

      return PostsMapper.mapPostViewModel(doc, null, []);
    }

    return null;
  }

  public async createComment(
    postId: string,
    body: CreateCommentForPostDto,
    login: string,
  ): Promise<CommentViewModel | null> {
    const findPost = await this.postsQueryRepository.findOne(postId);
    const user = await this.usersQueryRepository.findByLogin(login);

    if (!findPost || !user) {
      return null;
    }

    const newComment = new this.CommentModel<Comment>({
      content: body.content,
      commentatorInfo: { id: user._id, login },
      createdAt: new Date().toISOString(),
      postId: findPost._id,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });

    await this.commentsWriteRepository.save(newComment);

    return CommentMapper.mapCommentViewModel(newComment, null);
  }

  public async findAllComments(
    pagination: PaginationOptionsDto,
    postId: string,
    userLogin: string | null,
  ): Promise<Paginator<CommentViewModel[]> | null> {
    const post = await this.postsQueryRepository.findOne(postId);

    if (!post) {
      return null;
    }

    const { meta, items } = await this.commentsQueryRepository.findMany(pagination, postId);

    if (userLogin) {
      const user = await this.usersQueryRepository.findByLogin(userLogin);
      const reactions = await this.reactionsQueryRepository.findReactionsByIds(
        items.map((comment) => comment._id),
        user!._id,
        'comment',
      );

      return {
        ...meta,
        items: CommentMapper.mapCommentsViewModel(items, reactions),
      };
    }

    return {
      ...meta,
      items: CommentMapper.mapCommentsViewModel(items, null),
    };
  }

  public async incrementDecrementLikeCounter(
    postId: ObjectId,
    userReactionType: LikeStatuses | null,
    likeStatus: LikeStatuses,
  ) {
    if (likeStatus === LikeStatuses.NONE && userReactionType !== LikeStatuses.NONE) {
      if (userReactionType === LikeStatuses.LIKE) {
        return this.postsWriteRepository.setLike(postId, false);
      }

      return this.postsWriteRepository.setDislike(postId, false);
    }

    if (userReactionType === likeStatus) {
      return;
    }

    if (likeStatus === LikeStatuses.LIKE && userReactionType === LikeStatuses.DISLIKE) {
      await this.postsWriteRepository.setDislike(postId, false);
      return this.postsWriteRepository.setLike(postId, true);
    }

    if (likeStatus === LikeStatuses.DISLIKE && userReactionType === LikeStatuses.LIKE) {
      await this.postsWriteRepository.setLike(postId, false);
      return this.postsWriteRepository.setDislike(postId, true);
    }

    if (likeStatus === LikeStatuses.LIKE) {
      return this.postsWriteRepository.setLike(postId, true);
    }

    if (likeStatus === LikeStatuses.DISLIKE) {
      return this.postsWriteRepository.setDislike(postId, true);
    }
  }

  public async setLikeUnlikeForPost(
    postId: string,
    login: string,
    likeStatus: LikeStatuses,
  ): Promise<ReactionDocument | null> {
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
      await this.incrementDecrementLikeCounter(post._id, reaction.likeStatus, likeStatus);
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
      },
      createdAt: new Date(),
      likeStatus,
    });

    await this.incrementDecrementLikeCounter(post._id, null, likeStatus);
    await this.reactionsWriteRepository.save(reactionDTO);

    return reactionDTO;
  }
}
