import { Controller, Get, NotFoundException, Param, Query, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModel } from '../../Blogs/interfaces';
import { FindAllBlogsCommand } from '../../Blogs/handlers/find-all-blogs.handler';
import { FindOneBlogCommand } from '../../Blogs/handlers/find-one-blog.handler';
import { JwtTokenOptionalGuard } from '../../Auth/guards/jwt-token-optional.guard';
import { Request } from 'express';
import { FindAllPostsByBlogIdCommand } from '../../Posts/handlers/find-all-posts-for-blog.handler';

@Controller('blogs')
export class PublicBlogsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get()
  public async findAll(@Query() queryParams: PaginationBlogDto): Promise<Paginator<BlogViewModel[]>> {
    return this.commandBus.execute(new FindAllBlogsCommand(queryParams));
  }

  @Get('/:id')
  public async findOne(@Param('id') id: string) {
    const data = await this.commandBus.execute(new FindOneBlogCommand(id));

    if (!data) {
      throw new NotFoundException({});
    }

    return data;
  }

  @Get('/:id/posts')
  @UseGuards(JwtTokenOptionalGuard)
  public async findAllPosts(@Param('id') id: string, @Query() queryParams: PaginationBlogDto, @Req() req: Request) {
    const findBlog = await this.commandBus.execute(new FindOneBlogCommand(id));

    if (!findBlog) {
      throw new NotFoundException({});
    }

    return this.commandBus.execute(new FindAllPostsByBlogIdCommand(queryParams, findBlog.id, req.user?.login));
  }
}
