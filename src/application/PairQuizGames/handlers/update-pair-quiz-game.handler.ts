import { CommandHandler } from '@nestjs/cqrs';
import { EntityManager } from 'typeorm';
import { DbTransactionFactory, ITransactionRunner } from '../../../common/factories/transaction-factory';
import UserEntity from '../../../db/entities/user.entity';
import PairQuizGameEntity from '../../../db/entities/quiz-game/pair-quiz-game.entity';
import PairQuizPlayerProgressEntity from '../../../db/entities/quiz-game/pair-quiz-player-progress.entity';
import { PairQuizGameStatuses } from '../../../common/interfaces';
import { QuizQuestionsQueryRepository } from '../../QuizQuestins/repositories/quiz-questions.query.repository';
import { PairQuizQuestionsWriteRepository } from '../repositories/pair-quiz-questions/pair-quiz-questions.write.repository';
import PairQuizGameQuestionEntity from '../../../db/entities/quiz-game/pair-quiz-game-question.entity';
import QuizQuestionEntity from '../../../db/entities/quiz-game/quiz-question.entity';
import { PairQuizPlayerProgressWriteRepository } from '../repositories/pair-quiz-player-progress/pair-quiz-player-progress.write.repository';
import { PairQuizGamesWriteRepository } from '../repositories/pair-quiz-games/pair-quiz-games.write.repository';
import { PairQuizGameMapper } from '../mappers/pair-quiz-game.mapper';
import { PairQuizGamesQueryRepository } from '../repositories/pair-quiz-games/pair-quiz-games.query.repository';

export class UpdatePairQuizGameCommand {
  constructor(
    public options: {
      transactionRunner: ITransactionRunner;
      user: UserEntity;
      transactionManager: EntityManager;
      quizGame: PairQuizGameEntity;
    },
  ) {}
}

@CommandHandler(UpdatePairQuizGameCommand)
export class UpdatePairQuizGameHandler {
  constructor(
    private readonly quizQuestionsQueryRepository: QuizQuestionsQueryRepository,
    private readonly pairQuizQuestionsWriteRepository: PairQuizQuestionsWriteRepository,
    private readonly pairQuizGamesQueryRepository: PairQuizGamesQueryRepository,
    private readonly pairQuizPlayerProgressWriteRepository: PairQuizPlayerProgressWriteRepository,
    private readonly pairQuizGamesWriteRepository: PairQuizGamesWriteRepository,
    private readonly transactionRunner: DbTransactionFactory,
  ) {}

  private async generateQuestions(quizId: number, transactionManager: EntityManager) {
    const questions = await this.quizQuestionsQueryRepository.getRandomQuestions();

    if (questions.length > 0) {
      const questionsForQuiz: PairQuizGameQuestionEntity[] = [];

      questions.forEach((randomQuestion) => {
        const question = new QuizQuestionEntity();
        const quizQuestion = this.pairQuizQuestionsWriteRepository.create();

        question.id = randomQuestion.id;
        quizQuestion.question = question;
        quizQuestion.pair_quiz_game_id = quizId;

        questionsForQuiz.push(quizQuestion);
      });

      return this.pairQuizQuestionsWriteRepository.insertWithTransactions(questionsForQuiz, transactionManager);
    }
  }

  public async execute(command: UpdatePairQuizGameCommand) {
    const {
      options: { user, quizGame, transactionRunner, transactionManager },
    } = command;

    const secondPlayerProgress = new PairQuizPlayerProgressEntity();

    secondPlayerProgress.user = user;
    secondPlayerProgress.score = 0;

    quizGame.status = PairQuizGameStatuses.Active;
    quizGame.start_date = new Date();
    quizGame.second_player_progress = secondPlayerProgress;

    await this.generateQuestions(quizGame.id, transactionManager);
    await this.pairQuizPlayerProgressWriteRepository.saveWithTransactions(secondPlayerProgress, transactionManager);
    await this.pairQuizGamesWriteRepository.updateWithTransactions(
      quizGame.id,
      {
        status: quizGame.status,
        start_date: quizGame.start_date,
        second_player_progress: quizGame.second_player_progress,
      },
      transactionManager,
    );

    await transactionRunner.commitTransaction();

    const updatedQuizGame = await this.pairQuizGamesQueryRepository.find({ where: { id: quizGame.id } });

    if (updatedQuizGame) {
      return PairQuizGameMapper.mapPairQuizGameViewModel(updatedQuizGame);
    } else {
      throw new Error('Update pair quiz game');
    }
  }
}
