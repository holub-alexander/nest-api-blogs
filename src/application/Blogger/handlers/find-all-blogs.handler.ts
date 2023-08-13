import { CommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../Blogs/repositories/mongoose/blogs.query.repository';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModel } from '../../Blogs/interfaces';
import { BlogsMapper } from '../../Blogs/mappers/blogs.mapper';
import { UsersQueryRepository } from 'src/application/Users/repositories/mongoose/users.query.repository';
import { UnauthorizedException } from '@nestjs/common';
import { BlogsTypeOrmQueryRepository } from '../../Blogs/repositories/typeorm/blogs.query.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';

export class FindAllBlogsBloggerCommand {
  constructor(public paginationSortBlogDto: PaginationBlogDto, public userLogin: string) {}
}

@CommandHandler(FindAllBlogsBloggerCommand)
export class FindAllBlogsBloggerHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
  ) {}

  public async execute(command: FindAllBlogsBloggerCommand): Promise<Paginator<BlogViewModel[]>> {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

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
