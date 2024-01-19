import { CommandHandler } from '@nestjs/cqrs';
import { UsersWriteRepository } from '../../Users/repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../../Security-Devices/repositories/security-devices.write.repository';
import { BlogsWriteRepository } from '../../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../../Posts/repositories/posts.write.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/comments.write.repository';
import { QuizQuestionsWriteRepository } from '../../QuizQuestins/repositories/quiz-questions.write.repository';
import { PairQuizGamesWriteRepository } from '../../PairQuizGames/repositories/pair-quiz-games/pair-quiz-games.write.repository';
import { PairQuizPlayerProgressWriteRepository } from '../../PairQuizGames/repositories/pair-quiz-player-progress/pair-quiz-player-progress.write.repository';
import { PairQuizQuestionsWriteRepository } from '../../PairQuizGames/repositories/pair-quiz-questions/pair-quiz-questions.write.repository';
import { PairQuizPlayerAnswersWriteRepository } from '../../PairQuizGames/repositories/paiz-quiz-answers/pair-quiz-player-answers.write.repository';

export class DeleteAllCommand {}

@CommandHandler(DeleteAllCommand)
export class DeleteAllHandler {
  constructor(
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly usersWriteRepository: UsersWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesWriteRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly quizQuestionsWriteRepository: QuizQuestionsWriteRepository,
    private readonly pairQuizGamesWriteRepository: PairQuizGamesWriteRepository,
    private readonly pairQuizPlayerProgressWriteRepository: PairQuizPlayerProgressWriteRepository,
    private readonly pairQuizQuestionsWriteRepository: PairQuizQuestionsWriteRepository,
    private readonly pairQuizPlayerAnswersWriteRepository: PairQuizPlayerAnswersWriteRepository,
  ) {}

  public async execute() {
    return Promise.all([
      this.usersWriteRepository.deleteMany(),
      this.securityDevicesWriteRepository.deleteMany(),
      this.postsWriteRepository.deleteMany(),
      this.blogsWriteRepository.deleteMany(),
      this.reactionsWriteRepository.deleteMany(),
      this.commentsWriteRepository.deleteMany(),
      this.quizQuestionsWriteRepository.deleteMany(),
      this.pairQuizGamesWriteRepository.deleteMany(),
      this.pairQuizPlayerProgressWriteRepository.deleteMany(),
      // this.pairQuizQuestionsWriteRepository.deleteMany(),
      this.pairQuizPlayerAnswersWriteRepository.deleteMany(),
    ]);
  }
}
