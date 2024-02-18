import { CommandHandler } from '@nestjs/cqrs';

import { UnauthorizedException } from '@nestjs/common';
import { BlogsQueryRepository } from '../../repositories/blogs.query.repository';
import { UsersQueryRepository } from '../../../Users/repositories/users.query.repository';
import { Paginator } from '../../../../common/interfaces';
import { PaginationBlogDto } from '../../dto/pagination-blog.dto';
import { BlogViewModel } from '../../interfaces';
import { BlogsMapper } from '../../mappers/blogs.mapper';

export class FindAllBloggerBlogsBloggerCommand {
  constructor(public paginationSortBlogDto: PaginationBlogDto, public userLogin: string) {}
}

@CommandHandler(FindAllBloggerBlogsBloggerCommand)
export class FindAllBloggerBlogsHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: FindAllBloggerBlogsBloggerCommand): Promise<Paginator<BlogViewModel[]>> {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    console.log('user', user);

    if (!user) {
      throw new UnauthorizedException();
    }

    const res = await this.blogsQueryRepository.findAllWithPagination(command.paginationSortBlogDto, user.id);

    return {
      ...res.meta,
      items: BlogsMapper.mapBlogsViewModel(res.items),
    };
  }
}
