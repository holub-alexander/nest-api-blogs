import { PaginationBlogDto } from '../dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModel } from '../interfaces';
import { BlogsMapper } from '../../../common/mappers/blogs.mapper';
import { BlogsQueryRepository } from '../repositories/blogs.query.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class FindAllBlogsCommand {
  constructor(public paginationSortBlogDto: PaginationBlogDto, public superAdmin = false) {}
}

@CommandHandler(FindAllBlogsCommand)
export class FindAllBlogsHandler {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  public async execute(command: FindAllBlogsCommand): Promise<Paginator<BlogViewModel[]>> {
    const res = await this.blogsQueryRepository.findAll(command.paginationSortBlogDto);

    return {
      ...res.meta,
      items: command.superAdmin
        ? BlogsMapper.mapBlogsViewModelSuperAdmin(res.items)
        : BlogsMapper.mapBlogsViewModel(res.items),
    };
  }
}
