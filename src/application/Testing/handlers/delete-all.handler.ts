import { BlogsWriteRepository } from '../../Blogs/repositories/mongoose/blogs.write.repository';
import { PostsWriteRepository } from '../../Posts/repositories/mongoose/posts.write.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/comments.write.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersTypeOrmWriteRepository } from '../../Users/repositories/typeorm/users.write.repository';
import { SecurityDevicesTypeOrmWriteRepository } from '../../Security-Devices/repositories/typeorm/security-devices.write.repository';

export class DeleteAllCommand {}

@CommandHandler(DeleteAllCommand)
export class DeleteAllHandler {
  constructor(
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly usersWriteRepository: UsersTypeOrmWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesTypeOrmWriteRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
  ) {}

  public async execute() {
    return Promise.all([
      this.blogsWriteRepository.deleteMany(),
      this.postsWriteRepository.deleteMany(),
      this.usersWriteRepository.deleteMany(),
      this.commentsWriteRepository.deleteMany(),
      this.reactionsWriteRepository.deleteMany(),
      this.securityDevicesWriteRepository.deleteMany(),
    ]);
  }
}
