import { BlogsWriteRepository } from '../../Blogs/repositories/mongoose/blogs.write.repository';
import { PostsWriteRepository } from '../../Posts/repositories/mongoose/posts.write.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/mongoose/comments.write.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/mongoose/reactions.write.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersTypeOrmWriteRepository } from '../../Users/repositories/typeorm/users.write.repository';
import { SecurityDevicesTypeOrmWriteRepository } from '../../Security-Devices/repositories/typeorm/security-devices.write.repository';
import { BlogsTypeOrmWriteRepository } from '../../Blogs/repositories/typeorm/blogs.write.repository';
import { PostsTypeOrmWriteRepository } from '../../Posts/repositories/typeorm/posts.write.repository';
import { ReactionsTypeOrmWriteRepository } from '../../Reactions/repositories/typeorm/reactions.write.repository';
import { BanUserTypeOrmWriteRepository } from '../../BanUser/repositories/typeorm/ban-user.write.repository';

export class DeleteAllCommand {}

@CommandHandler(DeleteAllCommand)
export class DeleteAllHandler {
  constructor(
    private readonly blogsWriteRepository: BlogsTypeOrmWriteRepository,
    private readonly postsWriteRepository: PostsTypeOrmWriteRepository,
    private readonly usersWriteRepository: UsersTypeOrmWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesTypeOrmWriteRepository,
    // private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly reactionsWriteRepository: ReactionsTypeOrmWriteRepository,
    private readonly banUserTypeOrmWriteRepository: BanUserTypeOrmWriteRepository,
  ) {}

  public async execute() {
    return Promise.all([
      this.usersWriteRepository.deleteMany(),
      this.securityDevicesWriteRepository.deleteMany(),
      this.postsWriteRepository.deleteMany(),
      this.blogsWriteRepository.deleteMany(),
      this.reactionsWriteRepository.deleteMany(),
      this.banUserTypeOrmWriteRepository.deleteMany(),
      // this.commentsWriteRepository.deleteMany(),
    ]);
  }
}
