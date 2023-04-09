import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { BlogViewModel } from './interfaces';
import { PostsService } from '@/posts/posts.service';
import { BlogsWriteRepository } from '@/blogs/repositories/blogs.write.repository';
import { BlogsService } from '@/blogs/blogs.service';
import { CreateBlogDto } from '@/blogs/dto/create.dto';
import { PaginationBlogDto } from '@/blogs/dto/pagination-blog.dto';
import { UpdateBlogDto } from '@/blogs/dto/update.dto';
import { Paginator } from '@/common/interfaces';
import { CreatePostFromBlog } from '@/posts/dto/create.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  public async findAll(@Query() queryParams: PaginationBlogDto): Promise<Paginator<BlogViewModel[]>> {
    return this.blogsService.findAll(queryParams);
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
  public async findAllPosts(@Param('id') id: string, @Query() queryParams: PaginationBlogDto) {
    const findBlog = await this.blogsService.findOne(id);

    if (!findBlog) {
      throw new NotFoundException({});
    }

    return this.postsService.findAllByBlogId(queryParams, id);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() body: CreateBlogDto) {
    return this.blogsService.create(body);
  }

  @Post('/:id/posts')
  @HttpCode(201)
  public async createPostForCurrentBlog(@Param('id') id: string, @Body() body: CreatePostFromBlog) {
    const findBlog = await this.blogsService.findOne(id);

    if (!findBlog) {
      throw new NotFoundException({});
    }

    return this.postsService.create({ ...body, blogId: findBlog.id });
  }

  @Put('/:id')
  @HttpCode(204)
  public async updateOne(@Param('id') id: string, @Body() body: UpdateBlogDto) {
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
