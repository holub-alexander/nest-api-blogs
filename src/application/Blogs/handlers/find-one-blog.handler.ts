import { BlogViewModel } from '../interfaces';
import { BlogsMapper } from '../../../common/mappers/blogs.mapper';
import { BlogsQueryRepository } from '../repositories/blogs.query.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class FindOneBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(FindOneBlogCommand)
export class FindOneBlogHandler {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  public async execute(command: FindOneBlogCommand): Promise<BlogViewModel | null> {
    const blog = await this.blogsQueryRepository.findOne(command.blogId);

    return blog ? BlogsMapper.mapBlogViewModel(blog) : null;
  }
}
