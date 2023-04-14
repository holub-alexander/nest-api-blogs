import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { PostViewModel } from './interfaces';
import { PostsService } from './posts.service';
import { UpdatePostDto } from './dto/update.dto';
import { CreatePostDto } from './dto/create.dto';
import { PostsWriteRepository } from './repositories/posts.write.repository';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { Paginator } from '../common/interfaces';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  public async findAll(@Query() queryParams: PaginationOptionsDto): Promise<Paginator<PostViewModel[]>> {
    return this.postsService.findAll(queryParams);
  }

  @Get('/:id')
  public async findOne(@Param('id') id: string) {
    const data = await this.postsService.findOne(id);

    if (!data) {
      throw new NotFoundException({});
    }

    return data;
  }

  @Post()
  public async create(@Body() body: CreatePostDto) {
    const data = await this.postsService.create(body);

    if (!data) {
      throw new NotFoundException({});
    }

    return data;
  }

  @Put('/:id')
  @HttpCode(204)
  public async updateOne(@Param('id') id: string, @Body() body: UpdatePostDto) {
    const isUpdated = await this.postsWriteRepository.updateOne(id, body);

    if (!isUpdated) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Delete('/:id')
  @HttpCode(204)
  public async deleteOne(@Param('id') id: string) {
    const isDeleted = await this.postsWriteRepository.deleteOne(id);

    if (!isDeleted) {
      throw new NotFoundException({});
    }

    return true;
  }
}
