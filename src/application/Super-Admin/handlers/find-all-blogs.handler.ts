import { Paginator } from '../../../common/interfaces';
import { CommandHandler } from '@nestjs/cqrs';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { BlogViewModelSuperAdmin } from '../../Blogs/interfaces';
import { SuperAdminMapper } from '../mappers/super-admin.mapper';

export class FindAllBlogsSuperAdminCommand {
  constructor(public paginationSortBlogDto: PaginationBlogDto) {}
}

@CommandHandler(FindAllBlogsSuperAdminCommand)
export class FindAllBlogsSuperAdminHandler {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  public async execute(command: FindAllBlogsSuperAdminCommand): Promise<Paginator<BlogViewModelSuperAdmin[]>> {
    const res = await this.blogsQueryRepository.findAll(command.paginationSortBlogDto, null, true);

    return {
      ...res.meta,
      items: SuperAdminMapper.mapBlogsViewModel(res.items),
    };
  }
}
