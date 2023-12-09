import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCommentForPostDto } from '../dto/update.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { CommentsWriteRepository } from '../repositories/comments.write.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';

export class UpdateCommentCommand {
  constructor(public login: string, public body: UpdateCommentForPostDto, public id: string) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: UpdateCommentCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.login);

    if (!user) {
      throw new NotFoundException();
    }

    const comment = await this.commentsQueryRepository.findOne(command.id, user.id);

    if (!comment) {
      throw new NotFoundException();
    }

    if (user.login !== comment.user.login) {
      throw new ForbiddenException();
    }

    const isUpdated = await this.commentsWriteRepository.updateById(command.id, command.body);

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }
}
