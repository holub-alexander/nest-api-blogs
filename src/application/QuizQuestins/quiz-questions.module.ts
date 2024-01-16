import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QuizQuestionsController } from './quiz-questions.controller';
import { QuizQuestionsQueryRepository } from './repositories/quiz-questions.query.repository';
import { QuizQuestionsWriteRepository } from './repositories/quiz-questions.write.repository';
import { CreateQuizQuestionHandler } from './handlers/create-quiz-question.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import QuizQuestionEntity from '../../db/entities/quiz-game/quiz-question.entity';
import { DeleteQuizQuestionHandler } from './handlers/delete-quiz-question.handler';
import { UpdateQuizQuestionHandler } from './handlers/update-quiz-question.handler';
import { FindAllQuizQuestionsHandler } from './handlers/find-all-quiz-questions.handler';

export const CommandHandlers = [
  FindAllQuizQuestionsHandler,
  CreateQuizQuestionHandler,
  DeleteQuizQuestionHandler,
  UpdateQuizQuestionHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([QuizQuestionEntity])],
  controllers: [QuizQuestionsController],
  providers: [QuizQuestionsQueryRepository, QuizQuestionsWriteRepository, ...CommandHandlers],
})
export class QuizQuestionsModule {}
