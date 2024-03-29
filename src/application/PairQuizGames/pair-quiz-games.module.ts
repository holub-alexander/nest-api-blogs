import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PairQuizGamesController } from './pair-quiz-games.controller';
import PairQuizGameEntity from '../../db/entities/quiz-game/pair-quiz-game.entity';
import PairQuizPlayerProgressEntity from '../../db/entities/quiz-game/pair-quiz-player-progress.entity';
import { CreatePairQuizGameHandler } from './handlers/create-pair-quiz-game.handler';
import { PairQuizGamesWriteRepository } from './repositories/pair-quiz-games/pair-quiz-games.write.repository';
import { PairQuizGamesQueryRepository } from './repositories/pair-quiz-games/pair-quiz-games.query.repository';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import UserEntity from '../../db/entities/user.entity';
import { DbTransactionFactory } from '../../common/factories/transaction-factory';
import { PairQuizPlayerProgressWriteRepository } from './repositories/pair-quiz-player-progress/pair-quiz-player-progress.write.repository';
import { UpdatePairQuizGameHandler } from './handlers/update-pair-quiz-game.handler';
import { QuizQuestionsQueryRepository } from '../QuizQuestins/repositories/quiz-questions.query.repository';
import QuizQuestionEntity from '../../db/entities/quiz-game/quiz-question.entity';
import { PairQuizQuestionsWriteRepository } from './repositories/pair-quiz-questions/pair-quiz-questions.write.repository';
import PairQuizGameQuestionEntity from '../../db/entities/quiz-game/pair-quiz-game-question.entity';
import { FindUnfinishedPairQuizGameHandler } from './handlers/find-unfinished-pair-quiz-game.handler';
import { FindPairQuizGameByIdHandler } from './handlers/find-pair-quiz-game-by-id.handler';
import { CreateAnswerForNextQuestionHandler } from './handlers/create-answer-for-next-question.handler';
import { PairQuizPlayerAnswersWriteRepository } from './repositories/paiz-quiz-answers/pair-quiz-player-answers.write.repository';
import PairQuizPlayerAnswerEntity from '../../db/entities/quiz-game/pair-quiz-player-answer.entity';
import { FindCurrentUserStatisticHandler } from './handlers/find-current-user-stastic.handler';
import { PairQuizPlayerProgressQueryRepository } from './repositories/pair-quiz-player-progress/pair-quiz-player-progress.query.repository';
import { FindAllQuizGamesHandler } from './handlers/find-all-quiz-games.handler';
import { FindUsersTopHandler } from './handlers/find-users-top.handler';
import { SchedulerRegistry } from '@nestjs/schedule';

export const CommandHandlers = [
  CreatePairQuizGameHandler,
  UpdatePairQuizGameHandler,
  FindUnfinishedPairQuizGameHandler,
  FindPairQuizGameByIdHandler,
  CreateAnswerForNextQuestionHandler,
  FindCurrentUserStatisticHandler,
  FindAllQuizGamesHandler,
  FindUsersTopHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      PairQuizGameEntity,
      PairQuizPlayerProgressEntity,
      UserEntity,
      QuizQuestionEntity,
      PairQuizGameQuestionEntity,
      PairQuizPlayerAnswerEntity,
    ]),
  ],
  controllers: [PairQuizGamesController],
  providers: [
    SchedulerRegistry,
    DbTransactionFactory,
    PairQuizGamesWriteRepository,
    PairQuizGamesQueryRepository,
    UsersQueryRepository,
    PairQuizPlayerProgressWriteRepository,
    PairQuizQuestionsWriteRepository,
    QuizQuestionsQueryRepository,
    PairQuizPlayerAnswersWriteRepository,
    PairQuizPlayerProgressQueryRepository,
    ...CommandHandlers,
  ],
})
export class PairQuizGamesModule {}
