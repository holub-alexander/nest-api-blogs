import { Request } from 'express';
import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, Req, UseGuards } from '@nestjs/common';
import { JwtTokenGuard } from '../../Auth/guards/jwt-token.guard';
import { DeleteOneCommentCommand } from '../../Comments/handlers/delete-one-comment.handler';
import { UpdateCommentCommand } from '../../Comments/handlers/update-comment.handler';
import { MakeLikeUnlikeDto } from '../../Comments/dto/reaction.dto';
import { CommandBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { FindCommentCommand } from '../../Comments/handlers/find-comment.handler';
import { JwtTokenOptionalGuard } from '../../Auth/guards/jwt-token-optional.guard';
import { UpdateCommentForPostDto } from '../../Comments/dto/update.dto';
import { SetLikeUnlikeForCommentCommand } from '../../Comments/handlers/set-like-unlike.handler';

@SkipThrottle()
@Controller('comments')
export class PublicCommentsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/:id')
  @UseGuards(JwtTokenOptionalGuard)
  public async get(@Param('id') id: string, @Req() req: Request) {
    const data = await this.commandBus.execute(new FindCommentCommand(id, req.user?.login ?? null));

    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }

  @Delete('/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    return this.commandBus.execute(new DeleteOneCommentCommand(req.user.login, id));
  }

  @Put('/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async update(@Param('id') id: string, @Body() body: UpdateCommentForPostDto, @Req() req: Request) {
    return this.commandBus.execute(new UpdateCommentCommand(req.user.login, body, id));
  }

  @Put('/:id/like-status')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async setLikeUnlike(@Param('id') id: string, @Body() body: MakeLikeUnlikeDto, @Req() req: Request) {
    const isUpdated = await this.commandBus.execute(
      new SetLikeUnlikeForCommentCommand(id, req.user.login, body.likeStatus),
    );

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }
}
