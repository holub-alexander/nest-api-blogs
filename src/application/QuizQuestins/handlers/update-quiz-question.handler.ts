import { QuizQuestionsWriteRepository } from '../repositories/quiz-questions.write.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { UpdateQuizQuestionDto } from '../dto/update.dto';

export class UpdateQuizQuestionCommand {
  constructor(public id: string, public body: UpdateQuizQuestionDto) {}
}

@CommandHandler(UpdateQuizQuestionCommand)
export class UpdateQuizQuestionHandler {
  constructor(private readonly quizQuestionsWriteRepository: QuizQuestionsWriteRepository) {}

  public async execute(command: UpdateQuizQuestionCommand) {
    return this.quizQuestionsWriteRepository.updateOne(command.id, command.body);
  }
}
