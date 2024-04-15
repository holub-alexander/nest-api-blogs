import { CommandHandler } from '@nestjs/cqrs';
import { BanUnbanDto } from '../../../../common/dto/ban-unban.dto';
import { BlogsQueryRepository } from '../../repositories/blogs.query.repository';
import { BlogsWriteRepository } from '../../repositories/blogs.write.repository';

export class BanUnbanBlogCommand {
  constructor(public blogId: string, public body: BanUnbanDto) {}
}

@CommandHandler(BanUnbanBlogCommand)
export class BanUnbanBlogHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsWriteRepository: BlogsWriteRepository,
  ) {}

  public async execute(command: BanUnbanBlogCommand) {
    if (!command.blogId || !Number.isInteger(+command.blogId)) {
      return null;
    }

    const blog = await this.blogsQueryRepository.findOne(command.blogId.toString(), true);

    if (!blog) {
      return null;
    }

    await this.blogsWriteRepository.update(blog.id, {
      ban_date: command.body.isBanned ? new Date() : null,
      is_banned: command.body.isBanned,
    });

    return true;
  }
}
