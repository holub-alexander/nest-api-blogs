import { GamePairViewModel } from '../interfaces';
import PairQuizGameEntity from '../../../db/entities/quiz-game/pair-quiz-game.entity';
import { QuizQuestionViewModel } from '../../QuizQuestins/interfaces';
import PairQuizGameQuestionEntity from '../../../db/entities/quiz-game/pair-quiz-game-question.entity';

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
        answers: null,
        player: {
          id: quizGame.first_player_progress.user.id.toString(),
          login: quizGame.first_player_progress.user.login,
        },
        score: quizGame.first_player_progress.score,
      },
      secondPlayerProgress: quizGame.second_player_progress
        ? {
            answers: null,
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
      status: quizGame.status,
      pairCreatedDate: quizGame.pair_created_at.toISOString(),
      startGameDate: quizGame.start_date ? quizGame.start_date.toISOString() : null,
      finishGameDate: quizGame.finish_date ? quizGame.finish_date.toISOString() : null,
    };
  }
}
