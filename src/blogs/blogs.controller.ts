import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { PaginationAndSortQueryParams, SortDirections } from '../@types';
import { BlogsService } from './blogs.service';
import { BlogsWriteRepository } from './repositories/blogs.write.repository';
import { BlogInputModel, BlogPostInputModel } from './@types';
import { PostsService } from '../posts/posts.service';

export type BlogsQueryParams = PaginationAndSortQueryParams & { searchNameTerm?: string };

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsWriteRepository: BlogsWriteRepository,
    private blogsService: BlogsService,
    private postsService: PostsService,
  ) {}

  @Get()
  public async findAll(
    @Query('sortBy') sortBy: BlogsQueryParams['sortBy'],
    @Query('sortDirection') sortDirection: SortDirections,
    @Query('pageNumber') pageNumber: BlogsQueryParams['pageNumber'],
    @Query('pageSize') pageSize: BlogsQueryParams['pageSize'],
    @Query('searchNameTerm') searchNameTerm?: BlogsQueryParams['searchNameTerm'],
  ) {
    return this.blogsService.findAll({ sortBy, sortDirection, pageNumber, pageSize, searchNameTerm });
  }

  @Get('/:id')
  public async findOne(@Param('id') id: string) {
    const data = await this.blogsService.findOne(id);

    if (!data) {
      throw new NotFoundException({});
    }

    return data;
  }

  @Get('/:id/posts')
  public async findAllPosts(
    @Param('id') id: string,
    @Query('sortBy') sortBy: PaginationAndSortQueryParams['sortBy'],
    @Query('sortDirection') sortDirection: SortDirections,
    @Query('pageNumber') pageNumber: PaginationAndSortQueryParams['pageNumber'],
    @Query('pageSize') pageSize: PaginationAndSortQueryParams['pageSize'],
  ) {
    const findBlog = await this.blogsService.findOne(id);

    if (!findBlog) {
      throw new NotFoundException({});
    }

    return this.postsService.findAllByBlogId({
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      id,
    });
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() body: BlogInputModel) {
    return this.blogsService.createBlog(body);
  }

  public async createPostForCurrentBlog(@Param('id') id: string, @Body() body: BlogPostInputModel) {
    const findBlog = await this.blogsService.findOne(id);

    if (!findBlog) {
      throw new NotFoundException({});
    }

    return this.postsService.create({ ...body, blogId: findBlog.id });
  }

  @Put('/:id')
  @HttpCode(204)
  public async updateOne(@Param('id') id: string, @Body() body: BlogInputModel) {
    const isUpdated = await this.blogsWriteRepository.updateOne(id, body);

    if (!isUpdated) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Delete('/:id')
  @HttpCode(204)
  public async deleteOne(@Param('id') id: string) {
    const isDeleted = await this.blogsWriteRepository.deleteOne(id);

    if (!isDeleted) {
      throw new NotFoundException({});
    }

    return true;
  }
}
