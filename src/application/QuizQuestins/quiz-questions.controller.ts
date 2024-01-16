import { SkipThrottle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { QuizQuestionsQueryRepository } from './repositories/quiz-questions.query.repository';
import { QuizQuestionsWriteRepository } from './repositories/quiz-questions.write.repository';
import { BasicAuthGuard } from '../Auth/guards/basic-auth.guard';
import { CreateQuizQuestionDto } from './dto/create.dto';
import { CreateQuizQuestionCommand } from './handlers/create-quiz-question.handler';
import { SA_QUIZ_QUESTIONS_MAIN_ROUTE } from '../../common/constants/endpoints';
import { DeleteQuizQuestionCommand } from './handlers/delete-quiz-question.handler';
import { UpdateQuizQuestionDto } from './dto/update.dto';
import { UpdatePublishedQuestionDto } from './dto/update-published-question.dto';
import { UpdateQuizQuestionCommand } from './handlers/update-quiz-question.handler';
import { FindAllQuizQuestionsCommand } from './handlers/find-all-quiz-questions.handler';
import { PaginationQuizQuestionsDto } from './dto/pagination-quiz-questions.dto';

@SkipThrottle()
@Controller(SA_QUIZ_QUESTIONS_MAIN_ROUTE)
export class QuizQuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly quizQuestionsQueryRepository: QuizQuestionsQueryRepository,
    private readonly quizQuestionsWriteRepository: QuizQuestionsWriteRepository,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  @HttpCode(200)
  public async findAll(@Query() queryParams: PaginationQuizQuestionsDto) {
    return this.commandBus.execute(new FindAllQuizQuestionsCommand(queryParams));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  public async create(@Body() body: CreateQuizQuestionDto) {
    return this.commandBus.execute(new CreateQuizQuestionCommand(body));
  }

  @Delete('/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async delete(@Param('id') id: string) {
    const res = await this.commandBus.execute(new DeleteQuizQuestionCommand(id));

    if (!res) {
      throw new NotFoundException();
    }
  }

  @Put('/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async updateOne(@Param('id') id: string, @Body() body: UpdateQuizQuestionDto) {
    const res = await this.commandBus.execute(new UpdateQuizQuestionCommand(id, body));

    if (!res) {
      throw new NotFoundException();
    }
  }

  @Put('/:id/publish')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async updatePublishStatus(@Param('id') id: string, @Body() body: UpdatePublishedQuestionDto) {
    const res = await this.quizQuestionsWriteRepository.updatePublishStatus(id, body.published);

    if (!res) {
      throw new NotFoundException();
    }
  }
}
