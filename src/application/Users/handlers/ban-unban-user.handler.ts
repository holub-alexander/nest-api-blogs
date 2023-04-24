import { CommandHandler } from '@nestjs/cqrs';
import { UsersWriteRepository } from '../repositories/users.write.repository';
import { ObjectId } from 'mongodb';
import { CommentsWriteRepository } from 'src/application/Comments/repositories/comments.write.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import { SecurityDevicesWriteRepository } from '../../Security-Devices/repositories/security-devices.write.repository';

export class BanUnbanUserCommand {
  constructor(public userId: ObjectId, public isBanned: boolean, public banReason: string) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserHandler {
  constructor(
    private readonly usersWriteRepository: UsersWriteRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesWriteRepository,
  ) {}

  public async execute(command: BanUnbanUserCommand) {
    if (command.isBanned) {
      await this.securityDevicesWriteRepository.deleteAllDevices(command.userId);
    }

    return Promise.all([
      this.usersWriteRepository.banUnban(command.userId, command.isBanned, command.isBanned ? command.banReason : null),
      this.commentsWriteRepository.updateUserBanStatus(command.userId, command.isBanned),
      this.reactionsWriteRepository.updateUserBanStatus(command.userId, command.isBanned),
    ]);
  }
}
