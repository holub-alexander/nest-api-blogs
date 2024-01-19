import { Module } from '@nestjs/common';
import { DeleteAllHandler } from './handlers/delete-all.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersWriteRepository } from '../Users/repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/security-devices.write.repository';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../Posts/repositories/posts.write.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '../../db/entities/user.entity';
import DeviceEntity from '../../db/entities/device.entity';
import BlogEntity from '../../db/entities/blog.entity';
import PostEntity from '../../db/entities/post.entity';
import ReactionEntity from '../../db/entities/reaction.entity';
import { CommentsWriteRepository } from '../Comments/repositories/comments.write.repository';
import CommentEntity from '../../db/entities/comment.entity';
import { QuizQuestionsWriteRepository } from '../QuizQuestins/repositories/quiz-questions.write.repository';
import QuizQuestionEntity from '../../db/entities/quiz-game/quiz-question.entity';
import { PairQuizGamesWriteRepository } from '../PairQuizGames/repositories/pair-quiz-games/pair-quiz-games.write.repository';
import PairQuizGameEntity from '../../db/entities/quiz-game/pair-quiz-game.entity';
import { PairQuizPlayerProgressWriteRepository } from '../PairQuizGames/repositories/pair-quiz-player-progress/pair-quiz-player-progress.write.repository';
import PairQuizPlayerProgressEntity from '../../db/entities/quiz-game/pair-quiz-player-progress.entity';
import { PairQuizQuestionsWriteRepository } from '../PairQuizGames/repositories/pair-quiz-questions/pair-quiz-questions.write.repository';
import PairQuizGameQuestionEntity from '../../db/entities/quiz-game/pair-quiz-game-question.entity';
import { PairQuizPlayerAnswersWriteRepository } from '../PairQuizGames/repositories/paiz-quiz-answers/pair-quiz-player-answers.write.repository';
import PairQuizPlayerAnswerEntity from '../../db/entities/quiz-game/pair-quiz-player-answer.entity';

export const CommandHandlers = [DeleteAllHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UserEntity,
      DeviceEntity,
      BlogEntity,
      PostEntity,
      ReactionEntity,
      CommentEntity,
      QuizQuestionEntity,
      PairQuizGameEntity,
      PairQuizPlayerProgressEntity,
      PairQuizQuestionsWriteRepository,
      PairQuizPlayerAnswerEntity,
    ]),
  ],
  controllers: [],
  providers: [
    BlogsWriteRepository,
    PostsWriteRepository,
    ReactionsWriteRepository,
    UsersWriteRepository,
    SecurityDevicesWriteRepository,
    CommentsWriteRepository,
    QuizQuestionsWriteRepository,
    PairQuizGamesWriteRepository,
    PairQuizPlayerProgressWriteRepository,
    PairQuizGameQuestionEntity,
    PairQuizPlayerAnswersWriteRepository,
    ...CommandHandlers,
  ],
})
export class TestingModule {}
