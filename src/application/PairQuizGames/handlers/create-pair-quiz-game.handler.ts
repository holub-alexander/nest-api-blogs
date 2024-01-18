import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';
import { PairQuizGamesWriteRepository } from '../repositories/pair-quiz-games/pair-quiz-games.write.repository';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import PairQuizPlayerProgressEntity from '../../../db/entities/quiz-game/pair-quiz-player-progress.entity';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { PairQuizGameStatuses } from '../../../common/interfaces';
import { DbTransactionFactory, ITransactionRunner } from '../../../common/factories/transaction-factory';
import { PairQuizPlayerProgressWriteRepository } from '../repositories/pair-quiz-player-progress/pair-quiz-player-progress.write.repository';
import { PairQuizGameMapper } from '../mappers/pair-quiz-game.mapper';
import UserEntity from '../../../db/entities/user.entity';
import { PairQuizGamesQueryRepository } from '../repositories/pair-quiz-games/pair-quiz-games.query.repository';
import PairQuizGameEntity from '../../../db/entities/quiz-game/pair-quiz-game.entity';
import { UpdatePairQuizGameCommand } from './update-pair-quiz-game.handler';
import { GamePairViewModel } from '../interfaces';
import { FindUnfinishedPairQuizGameCommand } from './find-unfinished-pair-quiz-game.handler';

export class CreatePairQuizGameCommand {
  constructor(public userLogin: string) {}
}

@CommandHandler(CreatePairQuizGameCommand)
export class CreatePairQuizGameHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly dataSource: DataSource,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly pairQuizGamesWriteRepository: PairQuizGamesWriteRepository,
    private readonly pairQuizPlayerProgressWriteRepository: PairQuizPlayerProgressWriteRepository,
    private readonly pairQuizGamesQueryRepository: PairQuizGamesQueryRepository,
    private readonly transactionRunner: DbTransactionFactory,
  ) {}

  private async create({
    transactionRunner,
    transactionManager,
    user,
  }: {
    transactionRunner: ITransactionRunner;
    user: UserEntity;
    transactionManager: EntityManager;
  }) {
    const pairQuizGame = this.pairQuizGamesWriteRepository.create();
    const firstPlayerProgress = new PairQuizPlayerProgressEntity();

    firstPlayerProgress.user = user;
    firstPlayerProgress.score = 0;

    pairQuizGame.status = PairQuizGameStatuses.PendingSecondPlayer;
    pairQuizGame.first_player_progress = firstPlayerProgress;
    pairQuizGame.second_player_progress = null;

    await this.pairQuizGamesWriteRepository.saveWithTransactions(pairQuizGame, transactionManager);
    await this.pairQuizPlayerProgressWriteRepository.saveWithTransactions(firstPlayerProgress, transactionManager);

    await transactionRunner.commitTransaction();

    return PairQuizGameMapper.mapPairQuizGameViewModel(pairQuizGame);
  }

  private async updateQuizGame({
    user,
    quizGame,
    transactionRunner,
    transactionManager,
  }: {
    transactionRunner: ITransactionRunner;
    user: UserEntity;
    transactionManager: EntityManager;
    quizGame: PairQuizGameEntity;
  }) {
    return this.commandBus.execute(
      new UpdatePairQuizGameCommand({ user, quizGame, transactionRunner, transactionManager }),
    );
  }

  public async execute(command: CreatePairQuizGameCommand) {
    let transactionRunner = null;
    let response: GamePairViewModel | null = null;

    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const foundGame = await this.pairQuizGamesQueryRepository.findUnfinishedGameForCurrentUser(user.id);

    if (foundGame) {
      throw new ForbiddenException();
    }

    try {
      transactionRunner = await this.transactionRunner.createTransaction();

      await transactionRunner.startTransaction();

      const transactionManager = transactionRunner.transactionManager;

      const quizGame = await this.pairQuizGamesQueryRepository.findQuizGameWithPendingSecondPlayer(transactionManager);

      if (quizGame) {
        response = await this.updateQuizGame({ user, quizGame, transactionRunner, transactionManager });
      } else {
        response = await this.create({ transactionRunner, transactionManager, user });
      }

      return response;
    } catch (error) {
      if (transactionRunner) {
        await transactionRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      if (transactionRunner) {
        await transactionRunner.releaseTransaction();
      }
    }
  }
}
