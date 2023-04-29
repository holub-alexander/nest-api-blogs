import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModelSuperAdmin } from '../../Blogs/interfaces';
import { BasicAuthGuard } from '../../Auth/guards/basic-auth.guard';
import { FindAllBlogsSuperAdminCommand } from '../handlers/find-all-blogs.handler';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(private commandBus: CommandBus) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  public async findAll(@Query() queryParams: PaginationBlogDto): Promise<Paginator<BlogViewModelSuperAdmin[]>> {
    return this.commandBus.execute(new FindAllBlogsSuperAdminCommand(queryParams));
  }
}
