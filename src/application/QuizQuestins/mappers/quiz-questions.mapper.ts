import QuizQuestionEntity from '../../../db/entities/quiz-game/quiz-question.entity';
import { QuizQuestionViewModel } from '../interfaces';

export class QuizQuestionsMapper {
  public static mapQuizQuestionViewModel(quizQuestion: QuizQuestionEntity): QuizQuestionViewModel {
    return {
      id: quizQuestion.id.toString(),
      body: quizQuestion.body,
      correctAnswers: quizQuestion.correct_answers,
      published: quizQuestion.published,
      createdAt: quizQuestion.created_at.toISOString(),
      updatedAt: quizQuestion.updated_at.toISOString(),
    };
  }
}
