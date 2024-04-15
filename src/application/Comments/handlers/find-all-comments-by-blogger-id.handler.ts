import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentMapper } from '../mappers/comment.mapper';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { UnauthorizedException } from '@nestjs/common';

export class FindAllCommentsByBloggerIdCommand {
  constructor(public queryParams: PaginationOptionsDto, public userLogin: string) {}
}

@CommandHandler(FindAllCommentsByBloggerIdCommand)
export class FindAllCommentsByBloggerIdHandler {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: FindAllCommentsByBloggerIdCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new UnauthorizedException();
    }

    const { meta, items } = await this.commentsQueryRepository.findAllWithPagination(command.queryParams, {
      bloggerId: user.id,
    });

    console.log(items[0]);

    return {
      ...meta,
      items: CommentMapper.mapBlogsCommentsViewModel(items),
    };

    // return {
    //   ...meta,
    //   items: BloggerMapper.mapCommentBloggerViewModel(items, posts, reactions),
    // };
  }
}
