import { PostsService } from './posts.service';
import { PostsWriteRepository } from './repositories/posts.write.repository';
import { PaginationAndSortQueryParams, Paginator, SortDirections } from '../@types';
import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { PostInputModel, PostViewModel } from './@types';

@Controller('posts')
export class PostsController {
  constructor(private postsWriteRepository: PostsWriteRepository, private postsService: PostsService) {}

  @Get()
  public async findAll(
    @Query('sortBy') sortBy: PaginationAndSortQueryParams['sortBy'],
    @Query('sortDirection') sortDirection: SortDirections,
    @Query('pageNumber') pageNumber: PaginationAndSortQueryParams['pageNumber'],
    @Query('pageSize') pageSize: PaginationAndSortQueryParams['pageSize'],
  ): Promise<Paginator<PostViewModel[]>> {
    return this.postsService.findAll({
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    });
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
  public async create(@Body() body: PostInputModel) {
    const data = await this.postsService.create(body);

    if (!data) {
      throw new NotFoundException({});
    }

    return data;
  }

  @Put('/:id')
  @HttpCode(204)
  public async updateOne(@Param('id') id: string, @Body() body: PostInputModel) {
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
