import { CommandHandler } from '@nestjs/cqrs';
import { BanUnbanDto } from '../../../common/dto/ban-unban.dto';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { BlogsWriteRepository } from '../../Blogs/repositories/blogs.write.repository';

export class BanUnbanBlogSuperAdminCommand {
  constructor(public blogId: string, public body: BanUnbanDto) {}
}

@CommandHandler(BanUnbanBlogSuperAdminCommand)
export class BanUnbanBlogSuperAdminHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsWriteRepository: BlogsWriteRepository,
  ) {}

  public async execute(command: BanUnbanBlogSuperAdminCommand) {
    if (!command.blogId || !Number.isInteger(+command.blogId)) {
      return null;
    }

    const blog = await this.blogsQueryRepository.findOne(command.blogId.toString());

    if (!blog) {
      return null;
    }

    //   await this.blogsWriteRepository.updateBanStatus(
    //     blog.id,
    //     command.body.isBanned ? new Date() : null,
    //     command.body.isBanned,
    //   );
    //
    //   return true;
  }
}
