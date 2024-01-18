import { Injectable } from '@nestjs/common';
import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import QuizQuestionEntity from '../../../db/entities/quiz-game/quiz-question.entity';
import { PublishedStatuses, SortDirections } from '../../../common/interfaces';
import { PaginationQuizQuestionsDto } from '../dto/pagination-quiz-questions.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

const allowedFieldForSorting = {
  id: 'id',
  body: 'body',
  correctAnswers: 'correct_answers',
  published: 'published',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

@Injectable()
export class QuizQuestionsQueryRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity) private readonly quizQuestionRepository: Repository<QuizQuestionEntity>,
  ) {}

  public async findAllWithPagination({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
    publishedStatus,
    bodySearchTerm,
  }: PaginationQuizQuestionsDto) {
    const sorting = getObjectToSort({ sortBy, sortDirection, allowedFieldForSorting });

    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const skippedItems = (+pageNumber - 1) * +pageSizeValue;

    const totalCountQuery = await this.quizQuestionRepository.createQueryBuilder();
    const query = await this.quizQuestionRepository.createQueryBuilder();

    if (bodySearchTerm && bodySearchTerm.trim() !== '') {
      totalCountQuery.where('body ILIKE :bodySearchTerm', { bodySearchTerm: `%${bodySearchTerm}%` });
      query.where('body ILIKE :bodySearchTerm', { bodySearchTerm: `%${bodySearchTerm}%` });
    }

    if (publishedStatus && publishedStatus !== PublishedStatuses.All) {
      totalCountQuery.where('published = :publishedStatus', {
        publishedStatus: publishedStatus === PublishedStatuses.Published,
      });
      query.where('published = :publishedStatus', { publishedStatus: publishedStatus === PublishedStatuses.Published });
    }

    const totalCount = await totalCountQuery.getCount();

    const quizQuestions = await query
      .orderBy(sorting.field, sorting.direction.toUpperCase() as 'ASC' | 'DESC')
      .offset(skippedItems)
      .limit(pageSizeValue)
      .getMany();

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount: +totalCount,
    });

    return new PaginationDto(quizQuestions, paginationMetaDto);
  }

  public async getRandomQuestions(): Promise<QuizQuestionEntity[]> {
    return this.quizQuestionRepository.createQueryBuilder().select().orderBy('RANDOM()').limit(5).getMany();
  }
}
