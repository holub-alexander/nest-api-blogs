import { SkipThrottle } from '@nestjs/throttler';
import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PUBLIC_PAIR_QUIZ_GAME } from '../../common/constants/endpoints';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePairQuizGameCommand } from './handlers/create-pair-quiz-game.handler';
import { Request } from 'express';
import { JwtTokenGuard } from '../Auth/guards/jwt-token.guard';
import { FindUnfinishedPairQuizGameCommand } from './handlers/find-unfinished-pair-quiz-game.handler';
import { FindPairQuizGameByIdCommand } from './handlers/find-pair-quiz-game-by-id.handler';
import { CreateAnswerForNextQuestionCommand } from './handlers/create-answer-for-next-question.handler';
import { CreateAnswerDto } from './dto/create-answer.dto';

@SkipThrottle()
@Controller(PUBLIC_PAIR_QUIZ_GAME)
export class PairQuizGamesController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/connection')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async connectCurrentUserToQuizGame(@Req() req: Request) {
    return this.commandBus.execute(new CreatePairQuizGameCommand(req.user?.login));
  }

  @Post('/my-current/answers')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async createAnswerForNextQuestion(@Body() body: CreateAnswerDto, @Req() req: Request) {
    return this.commandBus.execute(new CreateAnswerForNextQuestionCommand(req.user?.login, body));
  }

  @Get('/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async findPairQuizGameById(@Req() req: Request, @Param('id') id: string) {
    const res = await this.commandBus.execute(new FindPairQuizGameByIdCommand(req.user?.login, id));

    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }

  @Get('/my-current')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async findUnfinishedPairQuizGame(@Req() req: Request) {
    const res = await this.commandBus.execute(new FindUnfinishedPairQuizGameCommand(req.user?.login));

    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }
}
