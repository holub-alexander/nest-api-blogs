import { QuizQuestionsWriteRepository } from '../repositories/quiz-questions.write.repository';
import { CreateQuizQuestionDto } from '../dto/create.dto';
import { CommandHandler } from '@nestjs/cqrs';

import { QuizQuestionsMapper } from '../mappers/quiz-questions.mapper';

export class CreateQuizQuestionCommand {
  constructor(public body: CreateQuizQuestionDto) {}
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionHandler {
  constructor(private readonly quizQuestionsWriteRepository: QuizQuestionsWriteRepository) {}

  public async execute(command: CreateQuizQuestionCommand) {
    const createdQuizQuestion = await this.quizQuestionsWriteRepository.create();

    createdQuizQuestion.body = command.body.body;
    createdQuizQuestion.correct_answers = command.body.correctAnswers;
    createdQuizQuestion.published = false;
    createdQuizQuestion.created_at = new Date();
    createdQuizQuestion.updated_at = new Date();

    const response = await this.quizQuestionsWriteRepository.save(createdQuizQuestion);

    if (!response) {
      return null;
    }

    return QuizQuestionsMapper.mapQuizQuestionViewModel(response);
  }
}
