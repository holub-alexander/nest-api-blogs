import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCommentForPostDto } from '../dto/update.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentsTypeOrmQueryRepository } from '../repositories/typeorm/comments.query.repository';
import { CommentsTypeOrmWriteRepository } from '../repositories/typeorm/comments.write.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { BanUserTypeOrmQueryRepository } from '../../BanUser/repositories/typeorm/ban-user.query.repository';

export class UpdateCommentCommand {
  constructor(public login: string, public body: UpdateCommentForPostDto, public id: string) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler {
  constructor(
    private readonly commentsQueryRepository: CommentsTypeOrmQueryRepository,
    private readonly commentsWriteRepository: CommentsTypeOrmWriteRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
    private readonly banUserQueryRepository: BanUserTypeOrmQueryRepository,
  ) {}

  public async execute(command: UpdateCommentCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.login);

    if (!user) {
      throw new NotFoundException();
    }

    const comment = await this.commentsQueryRepository.findOne(command.id, user.id);

    if (!comment || comment.length === 0) {
      throw new NotFoundException();
    }

    // const bannedUserFound = await this.banUserQueryRepository.findBanForBlog(user._id, comment.blogId);

    // if (user.accountData.login !== comment.commentatorInfo.login || bannedUserFound) {
    //   throw new ForbiddenException();
    // }

    if (user.login !== comment[0].user_login) {
      throw new ForbiddenException();
    }

    const isUpdated = await this.commentsWriteRepository.updateById(command.id, command.body);

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }
}
