import { CommandHandler } from '@nestjs/cqrs';
import { BlogsWriteRepository } from '../../repositories/blogs.write.repository';
import { UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../../Users/repositories/users.query.repository';
import { BlogsQueryRepository } from '../../repositories/blogs.query.repository';

export class BindUserToBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindUserToBlogCommand)
export class BindUserToBlogHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: BindUserToBlogCommand) {
    const user = await this.usersQueryRepository.findUserById(command.userId);
    const blog = await this.blogsQueryRepository.findOne(command.blogId);

    if (!user || !blog) {
      throw new UnauthorizedException();
    }

    return this.blogsWriteRepository.update(blog.id, { user });
  }
}
