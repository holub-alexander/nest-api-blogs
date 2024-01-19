import { CommandHandler } from '@nestjs/cqrs';
import { PairQuizGamesQueryRepository } from '../repositories/pair-quiz-games/pair-quiz-games.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PairQuizPlayerAnswersWriteRepository } from '../repositories/paiz-quiz-answers/pair-quiz-player-answers.write.repository';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { PairQuizGameAnswerStatuses, PairQuizGameStatuses } from '../../../common/interfaces';
import { PairQuizGameMapper } from '../mappers/pair-quiz-game.mapper';
import { PairQuizPlayerProgressWriteRepository } from '../repositories/pair-quiz-player-progress/pair-quiz-player-progress.write.repository';
import { PairQuizGamesWriteRepository } from '../repositories/pair-quiz-games/pair-quiz-games.write.repository';

export class CreateAnswerForNextQuestionCommand {
  constructor(public userLogin: string, public body: CreateAnswerDto) {}
}

@CommandHandler(CreateAnswerForNextQuestionCommand)
export class CreateAnswerForNextQuestionHandler {
  constructor(
    private readonly pairQuizGamesQueryRepository: PairQuizGamesQueryRepository,
    private readonly pairQuizPlayerAnswersWriteRepository: PairQuizPlayerAnswersWriteRepository,
    private readonly pairQuizPlayerProgressWriteRepository: PairQuizPlayerProgressWriteRepository,
    private readonly pairQuizGamesWriteRepository: PairQuizGamesWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: CreateAnswerForNextQuestionCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const currentPairQuizGame = await this.pairQuizGamesQueryRepository.findActiveGameForCurrentUser(user.id);

    console.log('/pair-game-quiz/pairs/my-current', currentPairQuizGame);

    if (!currentPairQuizGame || currentPairQuizGame.quiz_questions.length === 0) {
      throw new ForbiddenException();
    }

    const currentUserProgress =
      currentPairQuizGame.second_player_progress?.user.id === user.id
        ? currentPairQuizGame.second_player_progress
        : currentPairQuizGame.first_player_progress;

    if (currentUserProgress.answers.length === currentPairQuizGame.quiz_questions.length) {
      throw new ForbiddenException();
    }

    const notAnsweredQuestionIndex = currentUserProgress.answers.length;
    const activeQuestion = currentPairQuizGame.quiz_questions[notAnsweredQuestionIndex];

    const newAnswer = this.pairQuizPlayerAnswersWriteRepository.create({
      pair_quiz: {
        id: currentPairQuizGame.id,
      },
      pair_question: {
        id: activeQuestion.id,
      },
      player_progress: {
        id: currentUserProgress.id,
      },
      answer_status: activeQuestion.question.correct_answers.includes(command.body.answer)
        ? PairQuizGameAnswerStatuses.Correct
        : PairQuizGameAnswerStatuses.Incorrect,
      answer_body: command.body.answer,
      added_at: new Date(),
    });

    const savedAnswer = await this.pairQuizPlayerAnswersWriteRepository.save(newAnswer);

    currentUserProgress.answers.push(savedAnswer);

    if (!currentUserProgress.start_date) {
      await this.pairQuizPlayerProgressWriteRepository.update(
        { id: currentUserProgress.id },
        { start_date: new Date() },
      );
    }

    if (activeQuestion.question.correct_answers.includes(command.body.answer)) {
      await this.pairQuizPlayerProgressWriteRepository.incrementScore(currentUserProgress.id);
    }

    // console.log('currentUserProgress.answers', currentUserProgress.answers, savedAnswer);

    if (currentUserProgress.answers.length === currentPairQuizGame.quiz_questions.length) {
      await this.pairQuizPlayerProgressWriteRepository.update(
        { id: currentUserProgress.id },
        { finish_date: new Date() },
      );

      const progress = await this.pairQuizGamesQueryRepository.findGameById(currentPairQuizGame.id.toString());

      if (!progress || !progress.second_player_progress) {
        throw new ForbiddenException();
      }

      const isFinishedGame = progress.first_player_progress.finish_date && progress.second_player_progress.finish_date;

      if (
        isFinishedGame &&
        currentUserProgress.answers.find((answer) => answer.answer_status === PairQuizGameAnswerStatuses.Correct)
      ) {
        if (
          new Date(progress.first_player_progress.finish_date).valueOf() <
          new Date(progress.second_player_progress.finish_date).valueOf()
        ) {
          await this.pairQuizPlayerProgressWriteRepository.incrementScore(progress.first_player_progress.id);
        }

        if (
          new Date(progress.second_player_progress.finish_date).valueOf() <
          new Date(progress.first_player_progress.finish_date).valueOf()
        ) {
          await this.pairQuizPlayerProgressWriteRepository.incrementScore(progress.second_player_progress.id);
        }
      }

      if (isFinishedGame) {
        await this.pairQuizGamesWriteRepository.update(
          { id: currentPairQuizGame.id },
          {
            status: PairQuizGameStatuses.Finished,
            finish_date: new Date(),
          },
        );
      }
    }

    return PairQuizGameMapper.mapCreatedAnswerForQuestion(savedAnswer);
  }
}
