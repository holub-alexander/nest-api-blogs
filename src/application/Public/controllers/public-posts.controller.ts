import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtTokenGuard } from '../../Auth/guards/jwt-token.guard';
import { CreateCommentForPostDto } from '../../Comments/dto/create.dto';
import { PostViewModel } from '../../Posts/interfaces';
import { MakeLikeUnlikeDto } from '../../Comments/dto/reaction.dto';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { Paginator } from '../../../common/interfaces';
import { JwtTokenOptionalGuard } from '../../Auth/guards/jwt-token-optional.guard';
import { CommandBus } from '@nestjs/cqrs';
import { FindAllPostsCommand } from '../../Posts/handlers/find-all-posts.handler';
import { FindPostCommand } from '../../Posts/handlers/find-post.handler';
import { SetLikeUnlikeForPostCommand } from '../../Posts/handlers/set-like-unlike.handler';
import { FindAllCommentsForPostCommand } from '../../Posts/handlers/find-all-comments-for-post.handler';
import { CreateCommentForPostCommand } from '../../Posts/handlers/create-comment-for-post.handler';

@SkipThrottle()
@Controller('posts')
export class PublicPostsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get()
  @UseGuards(JwtTokenOptionalGuard)
  public async findAll(
    @Query() queryParams: PaginationOptionsDto,
    @Req() req: Request,
  ): Promise<Paginator<PostViewModel[]>> {
    return this.commandBus.execute(new FindAllPostsCommand(queryParams, req.user?.login));
  }

  @Get('/:id')
  @UseGuards(JwtTokenOptionalGuard)
  public async findOne(@Param('id') id: string, @Req() req: Request) {
    const data = await this.commandBus.execute(new FindPostCommand(id, req.user?.login));

    if (!data) {
      throw new NotFoundException({});
    }

    return data;
  }

  @Post('/:id/comments')
  @UseGuards(JwtTokenGuard)
  @HttpCode(201)
  public async createComment(@Param('id') id: string, @Body() body: CreateCommentForPostDto, @Req() req: Request) {
    const res = await this.commandBus.execute(new CreateCommentForPostCommand(id, body, req.user.login));

    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }

  @Get('/:id/comments')
  @UseGuards(JwtTokenOptionalGuard)
  public async findAllComments(
    @Param('id') id: string,
    @Query() queryParams: PaginationOptionsDto,
    @Req() req: Request,
  ) {
    const res = await this.commandBus.execute(
      new FindAllCommentsForPostCommand(queryParams, id, req.user?.login ?? null),
    );

    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }

  @Put('/:id/like-status')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async setLikeUnlike(@Param('id') id: string, @Body() body: MakeLikeUnlikeDto, @Req() req: Request) {
    const isUpdated = await this.commandBus.execute(
      new SetLikeUnlikeForPostCommand(id, req.user.login, req.body.likeStatus),
    );

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }
}
