import { CommandHandler } from '@nestjs/cqrs';

import { UsersWriteRepository } from '../repositories/users.write.repository';
import { SecurityDevicesWriteRepository } from '../../Security-Devices/repositories/security-devices.write.repository';
import { DbTransactionFactory } from '../../../common/factories/transaction-factory';

export class BanUnbanUserCommand {
  constructor(public userId: number, public isBanned: boolean, public banReason: string, public banDate: Date) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserHandler {
  constructor(
    private readonly transactionRunner: DbTransactionFactory,
    private readonly usersWriteRepository: UsersWriteRepository,
    // private readonly commentsWriteRepository: CommentsWriteRepository,
    // private readonly postsWriteRepository: PostsWriteRepository, // private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesWriteRepository,
  ) {}

  public async execute(command: BanUnbanUserCommand) {
    let transactionRunner = null;

    try {
      transactionRunner = await this.transactionRunner.createTransaction();

      await transactionRunner.startTransaction();
      const transactionManager = transactionRunner.transactionManager;

      if (command.isBanned) {
        await this.securityDevicesWriteRepository.deleteAllDevicesByUserId({
          userId: command.userId,
          transactionManager,
        });
      }

      const res = await this.usersWriteRepository.banUnban({
        data: {
          userId: command.userId,
          isBanned: command.isBanned,
          banReason: command.isBanned ? command.banReason : null,
          banDate: command.isBanned ? command.banDate : null,
        },
        transactionManager,
      });

      await transactionRunner.commitTransaction();

      return res;
    } catch (error) {
      if (transactionRunner) {
        await transactionRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      if (transactionRunner) {
        await transactionRunner.releaseTransaction();
      }
    }
  }
}
