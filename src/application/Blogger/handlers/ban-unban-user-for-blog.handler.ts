import { CommandHandler } from '@nestjs/cqrs';
import { BanUserForBlogDto } from '../../Blogs/dto/ban-user.dto';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { BanUserTypeOrmQueryRepository } from '../../BanUser/repositories/typeorm/ban-user.query.repository';
import BannedUserInBlogEntity from '../../../db/entities/typeorm/banned-user-in-blog.entity';
import { BanUserTypeOrmWriteRepository } from '../../BanUser/repositories/typeorm/ban-user.write.repository';

export class BanUnbanUserForBlogCommand {
  constructor(public userId: number, public blogId: number, public userLogin: string, public body: BanUserForBlogDto) {}
}

@CommandHandler(BanUnbanUserForBlogCommand)
export class BanUnbanUserForBlogHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly banUserWriteRepository: BanUserTypeOrmWriteRepository,
    private readonly banUserQueryRepository: BanUserTypeOrmQueryRepository,
  ) {}

  public async execute(command: BanUnbanUserForBlogCommand) {
    const { isBanned, banReason } = command.body;

    const bannedUserFound = await this.banUserQueryRepository.findBanedUserForBlog(command.userId, command.blogId);

    if (bannedUserFound && bannedUserFound.length > 0 && isBanned) {
      return true;
    }

    if (command.body.isBanned) {
      const bannedUser = new BannedUserInBlogEntity();

      bannedUser.user_id = command.userId;
      bannedUser.is_banned = isBanned;
      bannedUser.ban_reason = banReason;
      bannedUser.created_at = new Date();
      bannedUser.blog_id = command.blogId;

      await this.banUserWriteRepository.create(bannedUser);
    } else {
      await this.banUserWriteRepository.unbanUserForBlog(command.userId, command.blogId);
    }

    return true;
  }
}
