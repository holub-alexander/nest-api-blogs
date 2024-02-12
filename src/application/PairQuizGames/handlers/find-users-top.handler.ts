import { CommandHandler } from '@nestjs/cqrs';
import { PairQuizPlayerProgressQueryRepository } from '../repositories/pair-quiz-player-progress/pair-quiz-player-progress.query.repository';
import { PaginationTopUsersDto } from '../dto/pagination-top-users.dto';
import { PairQuizGameMapper } from '../mappers/pair-quiz-game.mapper';

export class FindUsersTopCommand {
  constructor(public queryParams: PaginationTopUsersDto) {}
}

@CommandHandler(FindUsersTopCommand)
export class FindUsersTopHandler {
  constructor(private readonly pairQuizPlayerProgressQueryRepository: PairQuizPlayerProgressQueryRepository) {}

  public async execute(command: FindUsersTopCommand) {
    const res = await this.pairQuizPlayerProgressQueryRepository.findUsersTop(command.queryParams);

    return {
      ...res.meta,
      items: PairQuizGameMapper.mapTopUsers(res.items),
    };
  }
}
