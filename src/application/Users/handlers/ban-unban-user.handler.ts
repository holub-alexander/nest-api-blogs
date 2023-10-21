import { CommandHandler } from '@nestjs/cqrs';

import { UsersWriteRepository } from '../repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../../Security-Devices/repositories/security-devices.write.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/comments.write.repository';

export class BanUnbanUserCommand {
  constructor(public userId: string, public isBanned: boolean, public banReason: string, public banDate: Date) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserHandler {
  constructor(
    private readonly usersWriteRepository: UsersWriteRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesWriteRepository, // private readonly postsWriteRepository: PostsWriteRepository, // private readonly blogsWriteRepository: BlogsWriteRepository,
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
    ]);
  }
}
