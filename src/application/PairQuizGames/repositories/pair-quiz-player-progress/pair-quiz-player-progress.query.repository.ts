import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PairQuizPlayerProgressEntity from '../../../../db/entities/quiz-game/pair-quiz-player-progress.entity';
import { PairQuizGameUserStatisticQuery, PairQuizProgressStatuses, TopUsersQuery } from '../../../../common/interfaces';
import { PaginationMetaDto } from '../../../../common/dto/pagination-meta.dto';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { PaginationTopUsersDto } from '../../dto/pagination-top-users.dto';

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

  public async findUsersTop({
    pageSize = 10,
    pageNumber = 1,
    sort = ['avgScores desc', 'sumScore desc'],
  }: PaginationTopUsersDto) {
    const allowedFieldForSorting = {
      avgScores: 'avg_scores',
      sumScore: 'sum_scores',
      gamesCount: 'games_count',
      winsCount: 'wins_count',
      lossesCount: 'losses_count',
      drawsCount: 'draws_count',
      id: 'user.id',
      login: 'user.login',
    } as { [key: string]: string };

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;

    const pairProgressQueryBuilder = this.pairQuizPlayerProgressRepository.createQueryBuilder('quiz_game_progress');
    const winsSubQuery = () => {
      return this.pairQuizPlayerProgressRepository
        .createQueryBuilder('sub_query')
        .select('COUNT(sub_query.id)::INTEGER', 'wins_count')
        .leftJoin('sub_query.user', 'user_winner')
        .where(`sub_query.progress_status = '${PairQuizProgressStatuses.Win}'`)
        .andWhere('user_winner.id = user.id')
        .groupBy('user_winner.id');
    };

    const lossSubQuery = () => {
      return this.pairQuizPlayerProgressRepository
        .createQueryBuilder('sub_query')
        .select('COALESCE(COUNT(sub_query.id), 0)::INTEGER', 'losses_count')
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
      .select(['user.id', 'user.login'])
      .addSelect('SUM(quiz_game_progress.score)::INTEGER', 'sum_scores')
      .addSelect('ROUND(AVG(quiz_game_progress.score), 2)', 'avg_scores')
      .addSelect('COUNT(quiz_game_progress.id)::INTEGER', 'games_count')
      .addSelect(`COALESCE((${winsSubQuery().getQuery()}), 0)`, 'wins_count')
      .addSelect(`COALESCE((${lossSubQuery().getQuery()}), 0)`, 'losses_count')
      .addSelect(`COALESCE((${drawsSubQuery().getQuery()}), 0)`, 'draws_count')
      .leftJoin('quiz_game_progress.user', 'user');

    sort.forEach((criterion, index) => {
      const [fieldName, direction] = criterion.split(' ');

      console.log(fieldName, direction);

      if (index === 0) {
        query.orderBy(allowedFieldForSorting[fieldName], direction.toUpperCase() as 'ASC' | 'DESC');
      } else {
        query.addOrderBy(allowedFieldForSorting[fieldName], direction.toUpperCase() as 'ASC' | 'DESC');
      }
    });

    const totalCountQuery = await this.pairQuizPlayerProgressRepository
      .createQueryBuilder('quiz_game_progress')
      .leftJoin('quiz_game_progress.user', 'user')
      .select(['user.id AS user_id'])
      .select('user.id, COUNT(*) as count')
      .groupBy('user.id')
      .getRawMany();
    const totalCount = totalCountQuery.length;

    const topUsers = await query
      .groupBy('user.id')
      .offset(skippedItems)
      .limit(pageSizeValue)
      .getRawMany<TopUsersQuery>();

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber },
      totalCount: +totalCount,
    });

    return new PaginationDto(topUsers, paginationMetaDto);
  }
}
