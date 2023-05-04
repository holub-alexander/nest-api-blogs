import { CommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { BanUnbanDto } from '../../../common/dto/ban-unban.dto';
import { BlogsWriteRepository } from '../../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../../Posts/repositories/posts.write.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/comments.write.repository';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';

export class BanUnbanBlogSuperAdminCommand {
  constructor(public blogId: ObjectId, public body: BanUnbanDto) {}
}

@CommandHandler(BanUnbanBlogSuperAdminCommand)
export class BanUnbanBlogSuperAdminHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
  ) {}

  public async execute(command: BanUnbanBlogSuperAdminCommand) {
    const blog = await this.blogsQueryRepository.findOne(command.blogId.toString(), true);

    if (!blog) {
      return null;
    }

    if (command.body.isBanned) {
      await this.blogsWriteRepository.updateBanStatus(command.blogId, new Date(), true);
    } else {
      await this.blogsWriteRepository.updateBanStatus(command.blogId, null, false);
    }

    await this.postsWriteRepository.updateBanStatusByBlogId(command.blogId, command.body.isBanned);
    await this.commentsWriteRepository.updateBanStatusByBlogId(command.blogId, command.body.isBanned);

    return true;
  }
}
