import { CommandHandler } from '@nestjs/cqrs';
import { PaginationQuizQuestionsDto } from '../dto/pagination-quiz-questions.dto';
import { QuizQuestionsQueryRepository } from '../repositories/quiz-questions.query.repository';
import { Paginator } from '../../../common/interfaces';
import { QuizQuestionViewModel } from '../interfaces';
import { QuizQuestionsMapper } from '../mappers/quiz-questions.mapper';

export class FindAllQuizQuestionsCommand {
  constructor(public paginationQuizQuestion: PaginationQuizQuestionsDto) {}
}

@CommandHandler(FindAllQuizQuestionsCommand)
export class FindAllQuizQuestionsHandler {
  constructor(public quizQuestionsQueryRepository: QuizQuestionsQueryRepository) {}

  public async execute(command: FindAllQuizQuestionsCommand): Promise<Paginator<QuizQuestionViewModel[]>> {
    const res = await this.quizQuestionsQueryRepository.findAllWithPagination(command.paginationQuizQuestion);

    return {
      ...res.meta,
      items: QuizQuestionsMapper.mapQuizQuestionsViewModel(res.items),
    };
  }
}
