import { Body, Controller, Get, HttpCode, NotFoundException, Param, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModelSuperAdmin } from '../../Blogs/interfaces';
import { BasicAuthGuard } from '../../Auth/guards/basic-auth.guard';
import { FindAllBlogsSuperAdminCommand } from '../handlers/find-all-blogs.handler';
import { BanUnbanDto } from '../../../common/dto/ban-unban.dto';
import { ObjectId } from 'mongodb';
import { BanUnbanBlogSuperAdminCommand } from '../handlers/ban-unban-blog.handler';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(private commandBus: CommandBus) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  public async findAll(@Query() queryParams: PaginationBlogDto): Promise<Paginator<BlogViewModelSuperAdmin[]>> {
    return this.commandBus.execute(new FindAllBlogsSuperAdminCommand(queryParams));
  }

  @Put('/:blogId/ban')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async banUnbanBlog(@Param('blogId') blogId: string, @Body() body: BanUnbanDto) {
    const res = await this.commandBus.execute(new BanUnbanBlogSuperAdminCommand(blogId, body));

    if (!res) {
      throw new NotFoundException();
    }

    return true;
  }
}
