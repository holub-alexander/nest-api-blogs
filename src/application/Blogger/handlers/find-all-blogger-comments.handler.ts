import { CommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../Users/repositories/mongoose/users.query.repository';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { PostsQueryRepository } from '../../Posts/repositories/posts.query.repository';
import { CommentsQueryRepository } from '../../Comments/repositories/comments.query.repository';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { BloggerMapper } from '../mappers/blogger.mapper';
import { Paginator } from '../../../common/interfaces';
import { CommentBloggerViewModel } from '../interfaces';
import { CommentViewModel } from '../../Comments/interfaces';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../../../db/entities/mongoose/blog.entity';
import { Post, PostDocument } from '../../../db/entities/mongoose/post.entity';
import { ReactionsQueryRepository } from '../../Reactions/repositories/reactions.query.repository';
import { InjectModel } from '@nestjs/mongoose';

export class FindAllBloggerCommentsCommand {
  constructor(public paginationSortBlogDto: PaginationBlogDto, public userLogin: string) {}
}

@CommandHandler(FindAllBloggerCommentsCommand)
export class FindAllBloggerCommentsHandler implements OnModuleInit {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly reactionsQueryRepository: ReactionsQueryRepository,
    @InjectModel(Blog.name) private blogCollection: Model<BlogDocument>,
    @InjectModel(Post.name) private postCollection: Model<PostDocument>,
  ) {}

  async onModuleInit() {
    // const userId = new ObjectId('64c6685e8a21123c540f5881');
    // const login = 'lg-418583';
    // const rawBlogIds = await this.blogCollection.find({ 'bloggerInfo.login': login }, { _id: 1 });
    // const blogIds = rawBlogIds.map((b) => b._id);
    //
    // // console.log(blogIds);
    //
    // const posts = await this.postCollection.find({ 'blog.id': { $in: blogIds } });
    // const postsIds = posts.map((p) => p._id);
    //
    // // @ts-ignore
    // const { meta, items } = await this.commentsQueryRepository.findAllByPostsIds({}, postsIds, userId);
    //
    // const reactions = await this.reactionsQueryRepository.findReactionsByIds(
    //   items.map((comment) => comment._id),
    //   userId,
    //   'comment',
    // );
    //
    // const res = {
    //   ...meta,
    //   items: BloggerMapper.mapCommentBloggerViewModel(items, posts, reactions),
    // };
    //
    // console.log(res);
  }
  public async execute(
    command: FindAllBloggerCommentsCommand,
  ): Promise<Paginator<CommentBloggerViewModel[] | Omit<CommentViewModel, 'likesInfo'>[]> | never> {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new UnauthorizedException();
    }

    const rawBlogIds = await this.blogCollection.find({ 'bloggerInfo.login': command.userLogin }, { _id: 1 });
    const blogIds = rawBlogIds.map((b) => b._id);

    const posts = await this.postCollection.find({ 'blog.id': { $in: blogIds } });
    const postsIds = posts.map((p) => p._id);

    // const foundPosts = await this.postsQueryRepository.findAllByUserId(user._id);
    // const postsIds = foundPosts.map((post) => post._id);

    const { meta, items } = await this.commentsQueryRepository.findAllByPostsIds(
      command.paginationSortBlogDto,
      postsIds,
      user._id,
    );

    const reactions = await this.reactionsQueryRepository.findReactionsByIds(
      items.map((comment) => comment._id),
      user._id,
      'comment',
    );

    return {
      ...meta,
      items: BloggerMapper.mapCommentBloggerViewModel(items, posts, reactions),
    };
  }
}
