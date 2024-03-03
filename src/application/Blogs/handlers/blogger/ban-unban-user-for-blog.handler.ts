import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { BanUserForBlogDto } from '../../dto/ban-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FindOneUserCommand } from '../../../Users/handlers/find-one-user.handler';
import { CheckAccessToBlogCommand } from '../../../Blogger/handlers/check-access-to-blog.handler';
import { BannedUserInBlogWriteRepository } from '../../../BannedUserInBlog/repositories/banned-user-in-blog.write.repository';
import { BannedUserInBlogQueryRepository } from '../../../BannedUserInBlog/repositories/banned-user-in-blog.query.repository';

export class BanUnbanUserForBlogCommand {
  constructor(public userId: string, public currentUserLogin: string, public body: BanUserForBlogDto) {}
}

@CommandHandler(BanUnbanUserForBlogCommand)
export class BanUnbanUserForBlogHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly bannedUserInBlogWriteRepository: BannedUserInBlogWriteRepository,
    private readonly bannedUserInBlogQueryRepository: BannedUserInBlogQueryRepository,
  ) {}

  public async execute(command: BanUnbanUserForBlogCommand) {
    const { isBanned, banReason, blogId } = command.body;

    const user = await this.commandBus.execute(new FindOneUserCommand(command.userId));

    if (!user) {
      throw new NotFoundException();
    }

    const foundBlog = await this.commandBus.execute(new CheckAccessToBlogCommand(blogId, command.currentUserLogin));

    if (!foundBlog || foundBlog.user.login !== command.currentUserLogin) {
      throw new ForbiddenException();
    }

    const bannedUserFound = await this.bannedUserInBlogQueryRepository.find({
      where: { user: { id: user.id }, blog: { id: foundBlog.id } },
    });

    if (bannedUserFound?.is_banned && isBanned) {
      return true;
    }

    if (!bannedUserFound) {
      const bannedUser = this.bannedUserInBlogWriteRepository.create({
        user,
        is_banned: isBanned,
        ban_reason: banReason,
        created_at: new Date(),
        blog: foundBlog,
      });

      return this.bannedUserInBlogWriteRepository.save(bannedUser, {});
    } else {
      await this.bannedUserInBlogWriteRepository.updateBanStatus(user.id, foundBlog.id, isBanned);
    }

    return true;
  }
}
