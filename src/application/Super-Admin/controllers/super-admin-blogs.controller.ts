import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FindAllBlogsCommand } from '../../Blogs/handlers/find-all-blogs.handler';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModel } from '../../Blogs/interfaces';
import { BasicAuthGuard } from '../../Auth/guards/basic-auth.guard';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(private commandBus: CommandBus) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  public async findAll(@Query() queryParams: PaginationBlogDto): Promise<Paginator<BlogViewModel[]>> {
    return this.commandBus.execute(new FindAllBlogsCommand(queryParams, true));
  }
}
