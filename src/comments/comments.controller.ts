import { Request } from 'express';
import { CommentsQueryRepository } from './repositories/comments.query.repository';
import { CommentsWriteRepository } from './repositories/comments.write.repository';
import { CommentsService } from './comments.service';
import { UsersQueryRepository } from '../users/repositories/users.query.repository';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateCommentForPostDto } from './dto/update.dto';
import { JwtTokenGuard } from '../auth/guards/jwt-token.guard';
import { MakeLikeUnlikeDto } from './dto/reaction.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtTokenOptionalGuard } from '../auth/guards/jwt-token-optional.guard';

@SkipThrottle()
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly commentsService: CommentsService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get('/:id')
  @UseGuards(JwtTokenOptionalGuard)
  public async get(@Param('id') id: string, @Req() req: Request) {
    const data = await this.commentsService.findOne(id, req.user?.login ?? null);

    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }

  @Delete('/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const user = await this.usersQueryRepository.findByLogin(req.user.login);
    const comment = await this.commentsQueryRepository.find(id);

    if (!user || !comment) {
      throw new NotFoundException();
    }

    if (user.accountData.login !== comment.commentatorInfo.login) {
      throw new ForbiddenException();
    }

    const deleteComment = await this.commentsWriteRepository.deleteById(req.params.id);

    if (!deleteComment) {
      throw new NotFoundException();
    }
  }

  @Put('/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async update(@Param('id') id: string, @Body() body: UpdateCommentForPostDto, @Req() req: Request) {
    const comment = await this.commentsQueryRepository.find(id);
    const user = await this.usersQueryRepository.findByLogin(req.user.login);

    if (!user || !comment) {
      throw new NotFoundException();
    }

    if (user.accountData.login !== comment.commentatorInfo.login) {
      throw new ForbiddenException();
    }

    const isUpdated = await this.commentsWriteRepository.updateById(id, body);

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }

  @Put('/:id/like-status')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async setLikeUnlike(@Param('id') id: string, @Body() body: MakeLikeUnlikeDto, @Req() req: Request) {
    const isUpdated = await this.commentsService.setLikeUnlike(id, req.user.login, body.likeStatus);

    console.log(isUpdated);

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }
}
