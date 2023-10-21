import { PaginationBlogDto } from '../dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModel } from '../interfaces';
import { BlogsMapper } from '../mappers/blogs.mapper';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../repositories/blogs.query.repository';

export class FindAllBlogsCommand {
  constructor(public paginationSortBlogDto: PaginationBlogDto) {}
}

@CommandHandler(FindAllBlogsCommand)
export class FindAllBlogsHandler {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  public async execute(command: FindAllBlogsCommand): Promise<Paginator<BlogViewModel[]>> {
    const res = await this.blogsQueryRepository.findAllWithPagination(command.paginationSortBlogDto);

    return {
      ...res.meta,
      items: BlogsMapper.mapBlogsViewModel(res.items),
    };
  }
}
