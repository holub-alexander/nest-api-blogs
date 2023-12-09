import { CommandHandler } from '@nestjs/cqrs';
import { UsersWriteRepository } from '../../Users/repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../../Security-Devices/repositories/security-devices.write.repository';
import { BlogsWriteRepository } from '../../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../../Posts/repositories/posts.write.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/comments.write.repository';

export class DeleteAllCommand {}

@CommandHandler(DeleteAllCommand)
export class DeleteAllHandler {
  constructor(
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly usersWriteRepository: UsersWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesWriteRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
  ) {}

  public async execute() {
    return Promise.all([
      this.usersWriteRepository.deleteMany(),
      this.securityDevicesWriteRepository.deleteMany(),
      this.postsWriteRepository.deleteMany(),
      this.blogsWriteRepository.deleteMany(),
      this.reactionsWriteRepository.deleteMany(),
      this.commentsWriteRepository.deleteMany(),
    ]);
  }
}
