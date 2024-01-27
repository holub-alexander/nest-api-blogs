import { CommandHandler } from '@nestjs/cqrs';
import { PairQuizGamesQueryRepository } from '../repositories/pair-quiz-games/pair-quiz-games.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { BadRequestException } from '@nestjs/common';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { PairQuizGameMapper } from '../mappers/pair-quiz-game.mapper';

export class FindAllQuizGamesCommand {
  constructor(public data: { userLogin: string; queryParams: PaginationOptionsDto }) {}
}

@CommandHandler(FindAllQuizGamesCommand)
export class FindAllQuizGamesHandler {
  constructor(
    private readonly pairQuizGamesQueryRepository: PairQuizGamesQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: FindAllQuizGamesCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.data.userLogin);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const res = await this.pairQuizGamesQueryRepository.findAllWithPagination(user.id, command.data.queryParams);

    return {
      ...res.meta,
      items: PairQuizGameMapper.mapPairQuizGamesViewModel(res.items),
    };
  }
}
