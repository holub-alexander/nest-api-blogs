import { CommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { PaginationBannedUsersDto } from '../dto/pagination-banned-users.dto';
import { Paginator } from '../../../common/interfaces';
import { UserBloggerViewModel } from '../interfaces';
import { BanUserQueryRepository } from '../../BanUser/repositories/ban-user.query.repository';
import { BloggerMapper } from '../mappers/blogger.mapper';

export class FindAllBannedUsersForBlogCommand {
  constructor(public blogId: ObjectId, public queryParams: PaginationBannedUsersDto) {}
}

@CommandHandler(FindAllBannedUsersForBlogCommand)
export class FindAllBannedUsersForBlogHandler {
  constructor(private readonly banUserQueryRepository: BanUserQueryRepository) {}

  public async execute(command: FindAllBannedUsersForBlogCommand): Promise<Paginator<UserBloggerViewModel[]>> {
    const { items, meta } = await this.banUserQueryRepository.findAllBannedUsersForBlog(
      command.queryParams,
      command.blogId,
    );

    return {
      ...meta,
      items: BloggerMapper.mapUserBloggerViewModel(items),
    };
  }
}
