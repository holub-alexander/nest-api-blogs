import { CommandHandler } from '@nestjs/cqrs';
import { PairQuizGamesQueryRepository } from '../repositories/pair-quiz-games/pair-quiz-games.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { PairQuizPlayerProgressQueryRepository } from '../repositories/pair-quiz-player-progress/pair-quiz-player-progress.query.repository';
import { BadRequestException } from '@nestjs/common';
import { PairQuizGameMapper } from '../mappers/pair-quiz-game.mapper';

export class FindCurrentUserStatisticCommand {
  constructor(public userLogin: string) {}
}

@CommandHandler(FindCurrentUserStatisticCommand)
export class FindCurrentUserStatisticHandler {
  constructor(
    private readonly pairQuizGamesQueryRepository: PairQuizGamesQueryRepository,
    private readonly pairQuizPlayerProgressQueryRepository: PairQuizPlayerProgressQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: FindCurrentUserStatisticCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const res = await this.pairQuizPlayerProgressQueryRepository.findUserStatistic(user.id);

    if (!res) {
      return PairQuizGameMapper.mapUserStatistics({
        user_id: user.id,
        games_count: 0,
        draws_count: 0,
        wins_count: 0,
        losses_count: 0,
        avg_scores: 0,
        sum_scores: 0,
      });
    }

    return PairQuizGameMapper.mapUserStatistics(res);
  }
}
