import { CommandHandler } from '@nestjs/cqrs';
import { BanUnbanDto } from '../../../common/dto/ban-unban.dto';
import { BlogsTypeOrmQueryRepository } from '../../Blogs/repositories/typeorm/blogs.query.repository';
import { BlogsTypeOrmWriteRepository } from '../../Blogs/repositories/typeorm/blogs.write.repository';

export class BanUnbanBlogSuperAdminCommand {
  constructor(public blogId: string, public body: BanUnbanDto) {}
}

@CommandHandler(BanUnbanBlogSuperAdminCommand)
export class BanUnbanBlogSuperAdminHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsTypeOrmQueryRepository,
    private readonly blogsWriteRepository: BlogsTypeOrmWriteRepository,
  ) {}

  public async execute(command: BanUnbanBlogSuperAdminCommand) {
    if (!command.blogId || !Number.isInteger(+command.blogId)) {
      return null;
    }

    const blog = await this.blogsQueryRepository.findOne(command.blogId.toString(), true);

    if (!blog || blog.length === 0) {
      return null;
    }

    await this.blogsWriteRepository.updateBanStatus(
      blog[0].id,
      command.body.isBanned ? new Date() : null,
      command.body.isBanned,
    );

    return true;
  }
}
