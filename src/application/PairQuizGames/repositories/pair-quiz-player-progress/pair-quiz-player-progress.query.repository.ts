import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PairQuizPlayerProgressEntity from '../../../../db/entities/quiz-game/pair-quiz-player-progress.entity';
import { PairQuizGameUserStatisticQuery, PairQuizProgressStatuses } from '../../../../common/interfaces';

@Injectable()
export class PairQuizPlayerProgressQueryRepository {
  constructor(
    @InjectRepository(PairQuizPlayerProgressEntity)
    private readonly pairQuizPlayerProgressRepository: Repository<PairQuizPlayerProgressEntity>,
  ) {}

  public async findOne(id: number) {
    return this.pairQuizPlayerProgressRepository.findBy({ id });
  }

  public async findUserStatistic(userId: number) {
    const pairProgressQueryBuilder = this.pairQuizPlayerProgressRepository.createQueryBuilder('quiz_game_progress');

    const winsSubQuery = () => {
      return this.pairQuizPlayerProgressRepository
        .createQueryBuilder('sub_query')
        .select('COUNT(sub_query.id)::INTEGER')
        .leftJoin('sub_query.user', 'user_winner')
        .where(`sub_query.progress_status = '${PairQuizProgressStatuses.Win}'`)
        .andWhere('user_winner.id = user.id')
        .groupBy('user_winner.id');
    };

    const lossSubQuery = () => {
      return this.pairQuizPlayerProgressRepository
        .createQueryBuilder('sub_query')
        .select('COUNT(sub_query.id)::INTEGER')
        .leftJoin('sub_query.user', 'user_loss')
        .where(`sub_query.progress_status = '${PairQuizProgressStatuses.Loss}'`)
        .andWhere('user_loss.id = user.id')
        .groupBy('user_loss.id');
    };

    const drawsSubQuery = () => {
      return this.pairQuizPlayerProgressRepository
        .createQueryBuilder('sub_query')
        .select('COUNT(sub_query.id)::INTEGER')
        .leftJoin('sub_query.user', 'user_draw')
        .where(`sub_query.progress_status = '${PairQuizProgressStatuses.Draw}'`)
        .andWhere('user_draw.id = user.id')
        .groupBy('user_draw.id');
    };

    const query = pairProgressQueryBuilder
      .leftJoinAndSelect('quiz_game_progress.user', 'user')
      .select(['user.id AS user_id'])
      .addSelect('SUM(quiz_game_progress.score)::INTEGER', 'sum_scores')
      .addSelect('ROUND(AVG(quiz_game_progress.score), 2)', 'avg_scores')
      .addSelect('COUNT(quiz_game_progress.id)::INTEGER', 'games_count')
      .addSelect(`(${winsSubQuery().getQuery()})`, 'wins_count')
      .addSelect(`(${lossSubQuery().getQuery()})`, 'losses_count')
      .addSelect(`(${drawsSubQuery().getQuery()})`, 'draws_count');

    return query
      .andWhere('user.id = :userId', { userId })
      .groupBy('user.id')
      .getRawOne<PairQuizGameUserStatisticQuery>();
  }
}
