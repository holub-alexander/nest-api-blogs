import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { PaginationBannedUsersDto } from '../../BannedUserInBlog/dto/pagination-banned-users.dto';
import { Paginator } from '../../../common/interfaces';
import { BannedUserInBlogQueryRepository } from '../../BannedUserInBlog/repositories/banned-user-in-blog.query.repository';
import { BannedUserInBlogMapper } from '../../BannedUserInBlog/mappers/banned-user-in-blog.mapper';
import { UserBloggerViewModel } from '../interfaces';
import { CheckAccessToBlogCommand } from './check-access-to-blog.handler';
import { NotFoundException } from '@nestjs/common';

export class FindAllBannedUsersForBlogCommand {
  constructor(public blogId: string, public userLogin: string, public queryParams: PaginationBannedUsersDto) {}
}

@CommandHandler(FindAllBannedUsersForBlogCommand)
export class FindAllBannedUsersForBlogHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly bannedUserInBlogQueryRepository: BannedUserInBlogQueryRepository,
  ) {}

  public async execute(command: FindAllBannedUsersForBlogCommand): Promise<Paginator<UserBloggerViewModel[]>> {
    const foundBlog = await this.commandBus.execute(new CheckAccessToBlogCommand(command.blogId, command.userLogin));

    if (!foundBlog) {
      throw new NotFoundException();
    }

    const { items, meta } = await this.bannedUserInBlogQueryRepository.findAllWithPagination(
      foundBlog.id,
      command.queryParams,
    );

    return {
      ...meta,
      items: BannedUserInBlogMapper.mapUserBloggerViewModel(items),
    };
  }
}
