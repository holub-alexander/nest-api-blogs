import { CommandHandler } from '@nestjs/cqrs';
import { BanUserForBlogDto } from '../../Blogs/dto/ban-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BanUser, BanUserDocument } from '../../../entity/ban-user.entity';
import { Model, Types } from 'mongoose';
import { BanUserWriteRepository } from '../../BanUser/repositories/ban-user.write.repository';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { BanUserQueryRepository } from '../../BanUser/repositories/ban-user.query.repository';

export class BanUnbanUserForBlogCommand {
  constructor(
    public userId: Types.ObjectId,
    public blogId: Types.ObjectId,
    public userLogin: string,
    public body: BanUserForBlogDto,
  ) {}
}

@CommandHandler(BanUnbanUserForBlogCommand)
export class BanUnbanUserForBlogHandler {
  constructor(
    @InjectModel(BanUser.name) private readonly BanUserModel: Model<BanUserDocument>,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly banUserWriteRepository: BanUserWriteRepository,
    private readonly banUserQueryRepository: BanUserQueryRepository,
  ) {}

  public async execute(command: BanUnbanUserForBlogCommand) {
    const { isBanned, banReason } = command.body;
    const bannedUserFound = await this.banUserQueryRepository.findBanForBlog(command.userId, command.blogId);

    if (bannedUserFound && isBanned) {
      return true;
    }

    if (command.body.isBanned) {
      const doc = new this.BanUserModel<BanUser>({
        user: {
          id: command.userId,
          login: command.userLogin,
        },
        banInfo: {
          isBanned,
          banReason,
          banDate: new Date(),
        },
        blogId: command.blogId,
      });

      await this.banUserWriteRepository.banUserForBlog(doc);
    } else {
      await this.banUserWriteRepository.unbanUserForBlog(command.userId, command.blogId);
    }

    return true;
  }
}
