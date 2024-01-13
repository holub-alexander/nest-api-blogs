import { QuizQuestionsWriteRepository } from '../repositories/quiz-questions.write.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class DeleteQuizQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuizQuestionCommand)
export class DeleteQuizQuestionHandler {
  constructor(private readonly quizQuestionsWriteRepository: QuizQuestionsWriteRepository) {}

  public async execute(command: DeleteQuizQuestionCommand) {
    return this.quizQuestionsWriteRepository.deleteOne(command.id);
  }
}
