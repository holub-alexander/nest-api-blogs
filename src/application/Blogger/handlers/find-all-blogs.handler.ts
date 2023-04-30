import { CommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModel } from '../../Blogs/interfaces';
import { BlogsMapper } from '../../Blogs/mappers/blogs.mapper';
import { UsersQueryRepository } from 'src/application/Users/repositories/users.query.repository';
import { UnauthorizedException } from '@nestjs/common';

export class FindAllBlogsBloggerCommand {
  constructor(public paginationSortBlogDto: PaginationBlogDto, public userLogin: string) {}
}

@CommandHandler(FindAllBlogsBloggerCommand)
export class FindAllBlogsBloggerHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: FindAllBlogsBloggerCommand): Promise<Paginator<BlogViewModel[]>> {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new UnauthorizedException();
    }

    const res = await this.blogsQueryRepository.findAllWithPagination(command.paginationSortBlogDto, user._id);

    return {
      ...res.meta,
      items: BlogsMapper.mapBlogsViewModel(res.items),
    };
  }
}
