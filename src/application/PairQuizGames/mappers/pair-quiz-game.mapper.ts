import { AnswerViewModel, GamePairViewModel } from '../interfaces';
import PairQuizGameEntity from '../../../db/entities/quiz-game/pair-quiz-game.entity';
import { QuizQuestionViewModel } from '../../QuizQuestins/interfaces';
import PairQuizGameQuestionEntity from '../../../db/entities/quiz-game/pair-quiz-game-question.entity';
import PairQuizPlayerAnswerEntity from '../../../db/entities/quiz-game/pair-quiz-player-answer.entity';

const formattedStatuses = {
  pending_second_player: 'PendingSecondPlayer',
  active: 'Active',
  finished: 'Finished',
};

export class PairQuizGameMapper {
  public static mapQuizQuestionsViewModel(
    data: PairQuizGameQuestionEntity[],
  ): Pick<QuizQuestionViewModel, 'body' & 'id'>[] {
    return data.map(
      (quizQuestion): Pick<QuizQuestionViewModel, 'body' & 'id'> => ({
        id: quizQuestion.id,
        body: quizQuestion.question.body,
      }),
    );
  }

  public static mapPairQuizGameViewModel(quizGame: PairQuizGameEntity): GamePairViewModel {
    return {
      id: quizGame.id.toString(),
      firstPlayerProgress: {
        answers: this.mapCreatedAnswersForQuestion(quizGame.first_player_progress.answers),
        player: {
          id: quizGame.first_player_progress.user.id.toString(),
          login: quizGame.first_player_progress.user.login,
        },
        score: quizGame.first_player_progress.score,
      },
      secondPlayerProgress: quizGame.second_player_progress
        ? {
            answers: this.mapCreatedAnswersForQuestion(quizGame.second_player_progress.answers),
            player: {
              id: quizGame.second_player_progress.user.id.toString(),
              login: quizGame.second_player_progress.user.login,
            },
            score: quizGame.second_player_progress.score,
          }
        : null,
      questions:
        quizGame.quiz_questions && quizGame.quiz_questions.length > 0
          ? this.mapQuizQuestionsViewModel(quizGame.quiz_questions)
          : null,
      status: formattedStatuses[quizGame.status],
      pairCreatedDate: quizGame.pair_created_at.toISOString(),
      startGameDate: quizGame.start_date ? quizGame.start_date.toISOString() : null,
      finishGameDate: quizGame.finish_date ? quizGame.finish_date.toISOString() : null,
    };
  }

  public static mapCreatedAnswersForQuestion(answers: PairQuizPlayerAnswerEntity[]): AnswerViewModel[] {
    return answers.map((answer) => ({
      questionId: answer.pair_question.id.toString(),
      answerStatus: answer.answer_status,
      addedAt: answer.added_at.toISOString(),
    }));
  }

  public static mapCreatedAnswerForQuestion(answer: PairQuizPlayerAnswerEntity): AnswerViewModel {
    return {
      questionId: answer.pair_question.id.toString(),
      answerStatus: answer.answer_status,
      addedAt: answer.added_at.toISOString(),
    };
  }
}
