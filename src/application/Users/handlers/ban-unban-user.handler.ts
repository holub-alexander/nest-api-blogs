import { CommandHandler } from '@nestjs/cqrs';
import { CommentsWriteRepository } from 'src/application/Comments/repositories/mongoose/comments.write.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/mongoose/reactions.write.repository';
import { PostsWriteRepository } from 'src/application/Posts/repositories/mongoose/posts.write.repository';
import { BlogsWriteRepository } from '../../Blogs/repositories/mongoose/blogs.write.repository';
import { UsersTypeOrmWriteRepository } from '../repositories/typeorm/users.write.repository';
import { SecurityDevicesTypeOrmWriteRepository } from '../../Security-Devices/repositories/typeorm/security-devices.write.repository';

export class BanUnbanUserCommand {
  constructor(public userId: string, public isBanned: boolean, public banReason: string, public banDate: Date) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserHandler {
  constructor(
    private readonly usersWriteRepository: UsersTypeOrmWriteRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesTypeOrmWriteRepository, // private readonly postsWriteRepository: PostsWriteRepository, // private readonly blogsWriteRepository: BlogsWriteRepository,
  ) {}

  public async execute(command: BanUnbanUserCommand) {
    if (command.isBanned) {
      await this.securityDevicesWriteRepository.deleteAllDevicesByUserId(command.userId);
    }

    return Promise.all([
      this.usersWriteRepository.banUnban(
        command.userId,
        command.isBanned,
        command.isBanned ? command.banReason : null,
        command.isBanned ? command.banDate : null,
      ),
      // this.commentsWriteRepository.updateUserBanStatus(command.userId, command.isBanned),
      // this.reactionsWriteRepository.updateUserBanStatus(command.userId, command.isBanned),
      // this.postsWriteRepository.updateUserBanStatus(command.userId, command.isBanned),
      // this.blogsWriteRepository.updateUserBanStatus(command.userId, command.isBanned),
    ]);
  }
}
