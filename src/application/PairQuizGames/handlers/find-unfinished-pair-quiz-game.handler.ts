import { CommandHandler } from '@nestjs/cqrs';
import { PairQuizGamesQueryRepository } from '../repositories/pair-quiz-games/pair-quiz-games.query.repository';
import { BadRequestException } from '@nestjs/common';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { PairQuizGameMapper } from '../mappers/pair-quiz-game.mapper';

export class FindUnfinishedPairQuizGameCommand {
  constructor(public userLogin: string) {}
}

@CommandHandler(FindUnfinishedPairQuizGameCommand)
export class FindUnfinishedPairQuizGameHandler {
  constructor(
    private readonly pairQuizGamesQueryRepository: PairQuizGamesQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: FindUnfinishedPairQuizGameCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const pairQuizGame = await this.pairQuizGamesQueryRepository.findUnfinishedGameForCurrentUser(user.id);

    if (pairQuizGame) {
      return PairQuizGameMapper.mapPairQuizGameViewModel(pairQuizGame);
    }

    return null;
  }
}
