import { CommandHandler } from '@nestjs/cqrs';
import { PaginationBannedUsersDto } from '../dto/pagination-banned-users.dto';
import { Paginator } from '../../../common/interfaces';
import { UserBloggerViewModel } from '../interfaces';
import { BloggerMapper } from '../mappers/blogger.mapper';
import { BanUserTypeOrmQueryRepository } from '../../BanUser/repositories/typeorm/ban-user.query.repository';

export class FindAllBannedUsersForBlogCommand {
  constructor(public blogId: number, public queryParams: PaginationBannedUsersDto) {}
}

@CommandHandler(FindAllBannedUsersForBlogCommand)
export class FindAllBannedUsersForBlogHandler {
  constructor(private readonly banUserQueryRepository: BanUserTypeOrmQueryRepository) {}

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
