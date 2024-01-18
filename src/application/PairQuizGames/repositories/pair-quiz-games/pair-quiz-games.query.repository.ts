import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import PairQuizGameEntity from '../../../../db/entities/quiz-game/pair-quiz-game.entity';
import { PairQuizGameStatuses } from '../../../../common/interfaces';

@Injectable()
export class PairQuizGamesQueryRepository {
  constructor(
    @InjectRepository(PairQuizGameEntity) private readonly pairQuizGameRepository: Repository<PairQuizGameEntity>,
  ) {}

  public async find(queryOptions: FindOneOptions<PairQuizGameEntity>) {
    return this.pairQuizGameRepository.findOne(queryOptions);
  }

  public async findUnfinishedGameForCurrentUser(userId: number, id?: string) {
    if (!id || !Number.isInteger(+id)) {
      return null;
    }

    const query = this.pairQuizGameRepository
      .createQueryBuilder('pair_quiz_games')
      .leftJoinAndSelect('pair_quiz_games.quiz_questions', 'quiz_questions')
      .leftJoinAndSelect('quiz_questions.question', 'question')
      .leftJoinAndSelect('pair_quiz_games.first_player_progress', 'first_player_progress')
      .leftJoinAndSelect('first_player_progress.user', 'first_player_progress_user')
      .leftJoinAndSelect('pair_quiz_games.second_player_progress', 'second_player_progress')
      .leftJoinAndSelect('second_player_progress.user', 'second_player_progress_user');

    if (+id) {
      query
        .where('(pair_quiz_games.status = :pendingStatus AND pair_quiz_games.id = :id)', {
          pendingStatus: PairQuizGameStatuses.PendingSecondPlayer,
          id,
        })
        .orWhere('(pair_quiz_games.status = :activeStatus AND pair_quiz_games.id = :id)', {
          activeStatus: PairQuizGameStatuses.Active,
          id,
        });
    } else {
      query
        .where('(pair_quiz_games.status = :pendingStatus AND first_player_progress.user.id = :userId)', {
          pendingStatus: PairQuizGameStatuses.PendingSecondPlayer,
          userId,
        })
        .orWhere('(pair_quiz_games.status = :activeStatus AND second_player_progress.user.id = :userId)', {
          activeStatus: PairQuizGameStatuses.Active,
          userId,
        });
    }

    return query.getOne();
  }

  public async findQuizGameWithPendingSecondPlayer(transactionManager?: EntityManager) {
    const queryOptions: FindOneOptions<PairQuizGameEntity> = {
      where: { status: PairQuizGameStatuses.PendingSecondPlayer },
    };

    if (transactionManager) {
      // return transactionManager
      //   .createQueryBuilder(PairQuizGameEntity, 'quizGame')
      //   .where({ status: PairQuizGameStatuses.PendingSecondPlayer })
      //   .setLock('pessimistic_read')
      //   .getOne();

      return transactionManager.findOne(PairQuizGameEntity, {
        ...queryOptions,
        transaction: true,
      });
    }

    return this.pairQuizGameRepository.findOne(queryOptions);
  }
}
