import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import PairQuizGameEntity from '../../../../db/entities/quiz-game/pair-quiz-game.entity';
import { PairQuizGameStatuses, SortDirections } from '../../../../common/interfaces';
import { PaginationOptionsDto } from '../../../../common/dto/pagination-options.dto';
import { getObjectToSort } from '../../../../common/utils/get-object-to-sort';
import { PaginationMetaDto } from '../../../../common/dto/pagination-meta.dto';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

@Injectable()
export class PairQuizGamesQueryRepository {
  constructor(
    @InjectRepository(PairQuizGameEntity) private readonly pairQuizGameRepository: Repository<PairQuizGameEntity>,
  ) {}

  private createQuery() {
    return this.pairQuizGameRepository
      .createQueryBuilder('pair_quiz_games')
      .leftJoinAndSelect('pair_quiz_games.quiz_questions', 'quiz_questions')
      .leftJoinAndSelect('quiz_questions.question', 'question')
      .leftJoinAndSelect('pair_quiz_games.first_player_progress', 'first_player_progress')
      .leftJoinAndSelect('first_player_progress.user', 'first_player_progress_user')
      .leftJoinAndSelect('first_player_progress.answers', 'first_player_progress_answers')
      .leftJoinAndSelect('first_player_progress_answers.pair_question', 'first_player_progress_answers_pair_question')
      .leftJoinAndSelect('pair_quiz_games.second_player_progress', 'second_player_progress')
      .leftJoinAndSelect('second_player_progress.answers', 'second_player_progress_answers')
      .leftJoinAndSelect('second_player_progress_answers.pair_question', 'second_player_progress_answers_pair_question')
      .leftJoinAndSelect('second_player_progress.user', 'second_player_progress_user');
  }

  public async find(queryOptions: FindOneOptions<PairQuizGameEntity>) {
    return this.pairQuizGameRepository.findOne(queryOptions);
  }

  public async findGameById(id: string) {
    if (!id || !Number.isInteger(+id)) {
      return null;
    }

    const query = this.createQuery();

    query.where('(pair_quiz_games.id = :id)', {
      id,
    });

    return query.getOne();
  }

  public async findActiveGameForCurrentUser(userId: number) {
    const query = this.createQuery();

    query
      .where('(pair_quiz_games.status = :activeStatus AND first_player_progress.user.id = :userId)', {
        activeStatus: PairQuizGameStatuses.Active,
        userId,
      })
      .orWhere('(pair_quiz_games.status = :activeStatus AND second_player_progress.user.id = :userId)', {
        activeStatus: PairQuizGameStatuses.Active,
        userId,
      });

    return query.getOne();
  }

  public async findUnfinishedGameForCurrentUser(userId: number) {
    const query = this.createQuery();

    query
      .where(
        '((pair_quiz_games.status = :activeStatus OR pair_quiz_games.status = :pendingStatus) AND first_player_progress.user.id = :userId)',
        {
          activeStatus: PairQuizGameStatuses.Active,
          pendingStatus: PairQuizGameStatuses.PendingSecondPlayer,
          userId,
        },
      )
      .orWhere(
        '((pair_quiz_games.status = :activeStatus OR pair_quiz_games.status = :pendingStatus) AND second_player_progress.user.id = :userId)',
        {
          activeStatus: PairQuizGameStatuses.Active,
          pendingStatus: PairQuizGameStatuses.PendingSecondPlayer,
          userId,
        },
      );

    return query.getOne();
  }

  public async findQuizGameWithPendingSecondPlayer(transactionManager?: EntityManager) {
    const queryOptions: FindOneOptions<PairQuizGameEntity> = {
      where: { status: PairQuizGameStatuses.PendingSecondPlayer },
    };

    if (transactionManager) {
      return transactionManager.findOne(PairQuizGameEntity, {
        ...queryOptions,
        transaction: true,
      });
    }

    return this.pairQuizGameRepository.findOne(queryOptions);
  }

  public async findAllWithPagination(
    userId: number,
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
  ) {
    const allowedFieldForSorting = {
      id: 'pair_quiz_games.id',
      status: 'pair_quiz_games.status',
      pairCreatedDate: 'pair_quiz_games.pair_created_at',
      startGameDate: 'pair_quiz_games.start_date',
      finishGameDate: 'pair_quiz_games.finish_date',
    };

    const sorting = getObjectToSort({
      sortBy,
      sortDirection,
      allowedFieldForSorting,
      defaultField: allowedFieldForSorting.pairCreatedDate,
    });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;

    const sourceQuery = this.createQuery();

    const totalCount = await sourceQuery.getCount();

    const quizQuestions = await sourceQuery
      .orderBy(sorting.field, sorting.direction.toUpperCase() as 'ASC' | 'DESC')
      .addOrderBy('pair_quiz_games.pair_created_at', 'DESC')
      .skip(skippedItems)
      .take(pageSizeValue)
      .getMany();

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount,
    });

    return new PaginationDto(quizQuestions, paginationMetaDto);
  }
}
