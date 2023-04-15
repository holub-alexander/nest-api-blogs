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
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostViewModel } from './interfaces';
import { PostsService } from './posts.service';
import { UpdatePostDto } from './dto/update.dto';
import { CreatePostDto } from './dto/create.dto';
import { PostsWriteRepository } from './repositories/posts.write.repository';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { Paginator } from '../common/interfaces';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { CreateCommentForPostDto } from '../comments/dto/create.dto';
import { JwtTokenGuard } from '../auth/guards/jwt-token.guard';
import { JwtTokenOptionalGuard } from '../auth/guards/jwt-token-optional.guard';
import { MakeLikeUnlikeDto } from '../comments/dto/reaction.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  @UseGuards(JwtTokenOptionalGuard)
  public async findAll(
    @Query() queryParams: PaginationOptionsDto,
    @Req() req: Request,
  ): Promise<Paginator<PostViewModel[]>> {
    return this.postsService.findAll(queryParams, req.user?.login);
  }

  @Get('/:id')
  @UseGuards(JwtTokenOptionalGuard)
  public async findOne(@Param('id') id: string, @Req() req: Request) {
    const data = await this.postsService.findOne(id, req.user?.login);

    if (!data) {
      throw new NotFoundException({});
    }

    return data;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  public async create(@Body() body: CreatePostDto) {
    const data = await this.postsService.create(body);

    if (!data) {
      throw new NotFoundException({});
    }

    return data;
  }

  @Put('/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async updateOne(@Param('id') id: string, @Body() body: UpdatePostDto) {
    const isUpdated = await this.postsWriteRepository.updateOne(id, body);

    if (!isUpdated) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Delete('/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async deleteOne(@Param('id') id: string) {
    const isDeleted = await this.postsWriteRepository.deleteOne(id);

    if (!isDeleted) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Post('/:id/comments')
  @UseGuards(JwtTokenGuard)
  @HttpCode(201)
  public async createComment(@Param('id') id: string, @Body() body: CreateCommentForPostDto, @Req() req: Request) {
    const res = await this.postsService.createComment(id, body, req.user.login);

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
    const res = await this.postsService.findAllComments(queryParams, id, req.user?.login ?? null);

    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }

  @Put('/:id/like-status')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async setLikeUnlike(@Param('id') id: string, @Body() body: MakeLikeUnlikeDto, @Req() req: Request) {
    const isUpdated = await this.postsService.setLikeUnlikeForPost(id, req.user.login, req.body.likeStatus);

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }
}
