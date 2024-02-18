import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';

export class CheckAccessToBlogCommand {
  constructor(public blogId: string, public userLogin: string) {}
}

@CommandHandler(CheckAccessToBlogCommand)
export class CheckAccessToBlogHandler {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  public async execute(command: CheckAccessToBlogCommand) {
    const foundBlog = await this.blogsQueryRepository.findOne(command.blogId);

    if (!foundBlog) {
      throw new NotFoundException({});
    }

    if (!foundBlog.user || foundBlog.user.login !== command.userLogin) {
      throw new ForbiddenException();
    }

    return foundBlog;
  }
}
