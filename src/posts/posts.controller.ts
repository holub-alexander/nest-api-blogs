import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { PostViewModel } from './interfaces';
import { PostsWriteRepository } from '@/posts/repositories/posts.write.repository';
import { PostsService } from '@/posts/posts.service';
import { Paginator } from '@/common/interfaces';
import { PaginationOptionsDto } from '@/common/dto/pagination-options.dto';
import { CreatePostDto } from '@/posts/dto/create.dto';
import { UpdatePostDto } from '@/posts/dto/update.dto';

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
