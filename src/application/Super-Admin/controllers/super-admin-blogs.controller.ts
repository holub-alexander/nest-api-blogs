import { Controller, Get, HttpCode, Param, Put, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BasicAuthGuard } from '../../Auth/guards/basic-auth.guard';
import { BlogViewModelSuperAdmin } from '../../Blogs/interfaces';
import { FindAllBlogsSuperAdminCommand } from '../handlers/find-all-blogs.handler';
import { BindUserToBlogCommand } from '../../Blogs/handlers/blogger/bind-user-to-blog.hander';
import { BindUserToBlogParamsDto } from '../dto/bind-user-to-blog-params.dto';

@SkipThrottle()
@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('/:id/bind-with-user/:userId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async bindBlog(@Param() params: BindUserToBlogParamsDto) {
    return this.commandBus.execute(new BindUserToBlogCommand(params.id, params.userId));
  }

  @Get()
  @UseGuards(BasicAuthGuard)
  public async findAll(@Query() queryParams: PaginationBlogDto): Promise<Paginator<BlogViewModelSuperAdmin[]>> {
    return this.commandBus.execute(new FindAllBlogsSuperAdminCommand(queryParams));
  }
}
