import { BlogViewModel } from '../interfaces';
import { BlogsMapper } from '../mappers/blogs.mapper';

import { CommandHandler } from '@nestjs/cqrs';
import { BlogsTypeOrmQueryRepository } from '../repositories/typeorm/blogs.query.repository';

export class FindOneBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(FindOneBlogCommand)
export class FindOneBlogHandler {
  constructor(private readonly blogsQueryRepository: BlogsTypeOrmQueryRepository) {}

  public async execute(command: FindOneBlogCommand): Promise<BlogViewModel | null> {
    const blog = await this.blogsQueryRepository.findOne(command.blogId);

    return blog && blog[0] ? BlogsMapper.mapBlogViewModel(blog[0]) : null;
  }
}
