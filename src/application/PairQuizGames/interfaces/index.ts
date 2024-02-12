import { QuizQuestionViewModel } from '../../QuizQuestins/interfaces';

export interface PlayerViewModel {
  id: string;
  login: string;
}

export interface AnswerViewModel {
  questionId: string;
  answerStatus: string;
  addedAt: string;
}

export interface GamePlayerProgressViewModel {
  answers: AnswerViewModel[] | null;
  player: PlayerViewModel;
  score: number;
}

export interface GamePairViewModel {
  id: string;
  firstPlayerProgress: GamePlayerProgressViewModel;
  secondPlayerProgress: GamePlayerProgressViewModel | null;
  questions: Pick<QuizQuestionViewModel, 'body' & 'id'> | null;
  status: string;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
}

export interface MyStatisticViewModel {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
}

export interface TopGamePlayerViewModel {
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  sumScore: number;
  avgScores: number;
  player: PlayerViewModel;
}
