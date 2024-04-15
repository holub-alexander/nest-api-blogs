import { Body, Controller, Get, HttpCode, NotFoundException, Param, Put, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BasicAuthGuard } from '../../Auth/guards/basic-auth.guard';
import { BlogViewModelSuperAdmin } from '../../Blogs/interfaces';
import { FindAllBlogsSuperAdminCommand } from '../handlers/find-all-blogs.handler';
import { BindUserToBlogCommand } from '../../Blogs/handlers/blogger/bind-user-to-blog.hander';
import { BindUserToBlogParamsDto } from '../dto/bind-user-to-blog-params.dto';
import { BanUnbanDto } from '../../../common/dto/ban-unban.dto';
import { BanUnbanBlogCommand } from '../../Blogs/handlers/blogger/ban-unban-blog-handler';

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

  @Put('/:blogId/ban')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async banUnbanBlog(@Param('blogId') blogId: string, @Body() body: BanUnbanDto) {
    const res = await this.commandBus.execute(new BanUnbanBlogCommand(blogId, body));

    if (!res) {
      throw new NotFoundException();
    }

    return true;
  }
}
