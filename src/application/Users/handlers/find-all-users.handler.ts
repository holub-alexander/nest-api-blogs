import { CommandHandler } from '@nestjs/cqrs';
import { PaginationUsersDto } from '../dto/pagination-users.dto';
import { Paginator } from '../../../common/interfaces';
import { UserViewModel } from '../interfaces';
import { UsersMapper } from '../mappers/users.mapper';
import { UsersTypeOrmQueryRepository } from '../repositories/typeorm/users.query.repository';

export class FindAllUsersCommand {
  constructor(public queryParams: PaginationUsersDto) {}
}

@CommandHandler(FindAllUsersCommand)
export class FindAllUsersHandler {
  constructor(private readonly usersQueryRepository: UsersTypeOrmQueryRepository) {}

  public async execute(command: FindAllUsersCommand): Promise<Paginator<UserViewModel[]>> {
    const { meta, items } = await this.usersQueryRepository.findAll(command.queryParams);

    return {
      ...meta,
      items: UsersMapper.mapUsersViewModel(items),
    };
  }
}
