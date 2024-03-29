import { AnswerViewModel, GamePairViewModel, MyStatisticViewModel, TopGamePlayerViewModel } from '../interfaces';
import PairQuizGameEntity from '../../../db/entities/quiz-game/pair-quiz-game.entity';
import PairQuizGameQuestionEntity from '../../../db/entities/quiz-game/pair-quiz-game-question.entity';
import PairQuizPlayerAnswerEntity from '../../../db/entities/quiz-game/pair-quiz-player-answer.entity';
import { PairQuizGameUserStatisticQuery, TopUsersQuery } from '../../../common/interfaces';

const formattedStatuses = {
  pending_second_player: 'PendingSecondPlayer',
  active: 'Active',
  finished: 'Finished',
};

export class PairQuizGameMapper {
  public static mapQuizQuestionsViewModel(data: PairQuizGameQuestionEntity[]): { body: string | null; id: string }[] {
    return data.map((quizQuestion): { body: string | null; id: string } => ({
      id: quizQuestion.id.toString(),
      body: quizQuestion.question.body,
    }));
  }

  public static mapPairQuizGameViewModel(quizGame: PairQuizGameEntity): GamePairViewModel {
    return {
      id: quizGame.id.toString(),
      firstPlayerProgress: {
        answers:
          quizGame.first_player_progress.answers && quizGame.first_player_progress.answers.length > 0
            ? this.mapCreatedAnswersForQuestion(quizGame.first_player_progress.answers)
            : [],
        player: {
          id: quizGame.first_player_progress.user.id.toString(),
          login: quizGame.first_player_progress.user.login,
        },
        score: quizGame.first_player_progress.score,
      },
      secondPlayerProgress: quizGame.second_player_progress
        ? {
            answers:
              quizGame.second_player_progress.answers && quizGame.second_player_progress.answers.length > 0
                ? this.mapCreatedAnswersForQuestion(quizGame.second_player_progress.answers)
                : [],
            player: {
              id: quizGame.second_player_progress.user.id.toString(),
              login: quizGame.second_player_progress.user.login,
            },
            score: quizGame.second_player_progress.score,
          }
        : null,
      questions:
        quizGame.quiz_questions && quizGame.quiz_questions.length > 0
          ? this.mapQuizQuestionsViewModel(quizGame.quiz_questions).sort((a, b) => +a.id - +b.id)
          : null,
      status: formattedStatuses[quizGame.status],
      pairCreatedDate: quizGame.pair_created_at.toISOString(),
      startGameDate: quizGame.start_date ? quizGame.start_date.toISOString() : null,
      finishGameDate: quizGame.finish_date ? quizGame.finish_date.toISOString() : null,
    };
  }

  public static mapPairQuizGamesViewModel(quizGames: PairQuizGameEntity[]): GamePairViewModel[] {
    return quizGames.map((quizGame) => this.mapPairQuizGameViewModel(quizGame));
  }

  public static mapCreatedAnswersForQuestion(answers: PairQuizPlayerAnswerEntity[]): AnswerViewModel[] {
    return answers
      .map((answer) => ({
        questionId: answer.pair_question.id.toString(),
        answerStatus: `${answer.answer_status[0].toUpperCase()}${answer.answer_status.slice(1)}`,
        addedAt: answer.added_at.toISOString(),
      }))
      .sort((a, b) => +a.questionId - +b.questionId);
  }

  public static mapCreatedAnswerForQuestion(answer: PairQuizPlayerAnswerEntity): AnswerViewModel {
    return {
      questionId: answer.pair_question.id.toString(),
      answerStatus: `${answer.answer_status[0].toUpperCase()}${answer.answer_status.slice(1)}`,
      addedAt: answer.added_at.toISOString(),
    };
  }

  public static mapUserStatistics(data: PairQuizGameUserStatisticQuery): MyStatisticViewModel {
    return {
      sumScore: data.sum_scores ?? 0,
      avgScores: data.avg_scores ? +data.avg_scores : 0,
      gamesCount: data.games_count ?? 0,
      winsCount: data.wins_count ?? 0,
      lossesCount: data.losses_count ?? 0,
      drawsCount: data.draws_count ?? 0,
    };
  }

  public static mapTopUsers(data: TopUsersQuery[]) {
    return data.map(
      (progress): TopGamePlayerViewModel => ({
        gamesCount: progress.games_count ?? 0,
        winsCount: progress.wins_count ?? 0,
        lossesCount: progress.losses_count ?? 0,
        drawsCount: progress.draws_count ?? 0,
        sumScore: progress.sum_scores ?? 0,
        avgScores: progress.avg_scores ? +progress.avg_scores : 0,
        player: {
          id: progress.user_id.toString(),
          login: progress.user_login,
        },
      }),
    );
  }
}
