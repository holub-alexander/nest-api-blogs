import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCommentForPostDto } from '../dto/update.dto';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { CommentsWriteRepository } from '../repositories/comments.write.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { BanUserQueryRepository } from '../../BanUser/repositories/ban-user.query.repository';

export class UpdateCommentCommand {
  constructor(public login: string, public body: UpdateCommentForPostDto, public id: string) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly banUserQueryRepository: BanUserQueryRepository,
  ) {}

  public async execute(command: UpdateCommentCommand) {
    const comment = await this.commentsQueryRepository.find(command.id);
    const user = await this.usersQueryRepository.findByLogin(command.login);

    if (!user || !comment) {
      throw new NotFoundException();
    }

    const bannedUserFound = await this.banUserQueryRepository.findBanForBlog(user._id, comment.blogId);

    if (user.accountData.login !== comment.commentatorInfo.login || bannedUserFound) {
      throw new ForbiddenException();
    }

    const isUpdated = await this.commentsWriteRepository.updateById(command.id, command.body);

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }
}
