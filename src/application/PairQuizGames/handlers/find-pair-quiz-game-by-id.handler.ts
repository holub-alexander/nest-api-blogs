import { CommandHandler } from '@nestjs/cqrs';
import { PairQuizGamesQueryRepository } from '../repositories/pair-quiz-games/pair-quiz-games.query.repository';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { PairQuizGameMapper } from '../mappers/pair-quiz-game.mapper';

export class FindPairQuizGameByIdCommand {
  constructor(public userLogin: string, public id: string) {}
}

@CommandHandler(FindPairQuizGameByIdCommand)
export class FindPairQuizGameByIdHandler {
  constructor(
    private readonly pairQuizGamesQueryRepository: PairQuizGamesQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: FindPairQuizGameByIdCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const pairQuizGame = await this.pairQuizGamesQueryRepository.findGameById(command.id.toString());

    if (!pairQuizGame) {
      return null;
    }

    if (
      pairQuizGame.first_player_progress.user.id === user.id ||
      pairQuizGame.second_player_progress?.user.id === user.id
    ) {
      return PairQuizGameMapper.mapPairQuizGameViewModel(pairQuizGame);
    } else {
      throw new ForbiddenException();
    }
  }
}
