import { CommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../Users/repositories/mongoose/users.query.repository';
import { UnauthorizedException } from '@nestjs/common';
import { PostsQueryRepository } from '../../Posts/repositories/posts.query.repository';
import { CommentsQueryRepository } from '../../Comments/repositories/comments.query.repository';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { BloggerMapper } from '../mappers/blogger.mapper';
import { Paginator } from '../../../common/interfaces';
import { CommentBloggerViewModel } from '../interfaces';
import { CommentViewModel } from '../../Comments/interfaces';

export class FindAllBloggerCommentsCommand {
  constructor(public paginationSortBlogDto: PaginationBlogDto, public userLogin: string) {}
}

@CommandHandler(FindAllBloggerCommentsCommand)
export class FindAllBloggerCommentsHandler {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  public async execute(
    command: FindAllBloggerCommentsCommand,
  ): Promise<Paginator<CommentBloggerViewModel[] | Omit<CommentViewModel, 'likesInfo'>[]> | never> {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new UnauthorizedException();
    }

    const foundPosts = await this.postsQueryRepository.findAllByUserId(user._id);
    const postsIds = foundPosts.map((post) => post._id);
    const { meta, items } = await this.commentsQueryRepository.findAllByPostsIds(
      command.paginationSortBlogDto,
      postsIds,
      user._id,
    );

    console.log(foundPosts);

    return {
      ...meta,
      items: BloggerMapper.mapCommentBloggerViewModel(items, foundPosts),
    };
  }
}
