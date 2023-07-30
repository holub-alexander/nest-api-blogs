import { CommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { UnauthorizedException } from '@nestjs/common';
import { PostsQueryRepository } from '../../Posts/repositories/posts.query.repository';
import { CommentsQueryRepository } from '../../Comments/repositories/comments.query.repository';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { BloggerMapper } from '../mappers/blogger.mapper';
import { Paginator } from '../../../common/interfaces';
import { CommentBloggerViewModel } from '../interfaces';
import { CommentViewModel } from '../../Comments/interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../../../entity/blog.entity';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../../../entity/post.entity';
import { ObjectId } from 'mongodb';

export class FindAllBloggerCommentsCommand {
  constructor(public paginationSortBlogDto: PaginationBlogDto, public userLogin: string) {}
}

@CommandHandler(FindAllBloggerCommentsCommand)
export class FindAllBloggerCommentsHandler {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    @InjectModel(Blog.name) private blogCollection: Model<BlogDocument>,
    @InjectModel(Post.name) private postCollection: Model<PostDocument>,
  ) {}

  public async execute(
    command: FindAllBloggerCommentsCommand,
  ): Promise<Paginator<CommentBloggerViewModel[] | Omit<CommentViewModel, 'likesInfo'>[]> | never> {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new UnauthorizedException();
    }
    const blogIds: string[] = await this.blogCollection.find({ 'bloggerInfo.login': command.userLogin }, { _id: 1 });
    const posts = await this.postCollection.find({ 'blog.id': { $in: blogIds } });
    const postsIds = posts.map((p) => p._id);
    // const foundPosts = await this.postsQueryRepository.findAllByUserId(user._id);
    // const postsIds = foundPosts.map((post) => post._id);

    const { meta, items } = await this.commentsQueryRepository.findAllByPostsIds(
      command.paginationSortBlogDto,
      postsIds,
      user._id,
    );

    return {
      ...meta,
      items: BloggerMapper.mapCommentBloggerViewModel(items, posts),
    };
  }
}
