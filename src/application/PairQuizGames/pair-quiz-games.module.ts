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

export const CommandHandlers = [
  CreatePairQuizGameHandler,
  UpdatePairQuizGameHandler,
  FindUnfinishedPairQuizGameHandler,
  FindPairQuizGameByIdHandler,
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
    ]),
  ],
  controllers: [PairQuizGamesController],
  providers: [
    DbTransactionFactory,
    PairQuizGamesWriteRepository,
    PairQuizGamesQueryRepository,
    UsersQueryRepository,
    PairQuizPlayerProgressWriteRepository,
    PairQuizQuestionsWriteRepository,
    QuizQuestionsQueryRepository,
    ...CommandHandlers,
  ],
})
export class PairQuizGamesModule {}
