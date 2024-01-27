import { SkipThrottle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PUBLIC_PAIR_QUIZ_GAME } from '../../common/constants/endpoints';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePairQuizGameCommand } from './handlers/create-pair-quiz-game.handler';
import { Request } from 'express';
import { JwtTokenGuard } from '../Auth/guards/jwt-token.guard';
import { FindUnfinishedPairQuizGameCommand } from './handlers/find-unfinished-pair-quiz-game.handler';
import { FindPairQuizGameByIdCommand } from './handlers/find-pair-quiz-game-by-id.handler';
import { CreateAnswerForNextQuestionCommand } from './handlers/create-answer-for-next-question.handler';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { FindCurrentUserStatisticCommand } from './handlers/find-current-user-stastic.handler';
import { FindAllQuizGamesCommand } from './handlers/find-all-quiz-games.handler';
import { PaginationOptionsDto } from '../../common/dto/pagination-options.dto';

@SkipThrottle()
@Controller(PUBLIC_PAIR_QUIZ_GAME)
export class PairQuizGamesController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/pairs/connection')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async connectCurrentUserToQuizGame(@Req() req: Request) {
    return this.commandBus.execute(new CreatePairQuizGameCommand(req.user?.login));
  }

  @Post('/pairs/my-current/answers')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async createAnswerForNextQuestion(@Body() body: CreateAnswerDto, @Req() req: Request) {
    return this.commandBus.execute(new CreateAnswerForNextQuestionCommand(req.user?.login, body));
  }

  @Get('/pairs/my')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async findAllQuizGames(@Req() req: Request, @Query() queryParams: PaginationOptionsDto) {
    return this.commandBus.execute(new FindAllQuizGamesCommand({ userLogin: req.user?.login, queryParams }));
  }

  @Get('/pairs/my-current')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async findUnfinishedPairQuizGame(@Req() req: Request) {
    const res = await this.commandBus.execute(new FindUnfinishedPairQuizGameCommand(req.user?.login));

    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }

  @Get('/users/my-statistic')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async findCurrentUserStatistic(@Req() req: Request) {
    return this.commandBus.execute(new FindCurrentUserStatisticCommand(req.user?.login));
  }

  @Get('/pairs/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(200)
  public async findPairQuizGameById(@Req() req: Request, @Param('id', ParseIntPipe) id: string) {
    const res = await this.commandBus.execute(new FindPairQuizGameByIdCommand(req.user?.login, id));

    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }
}
