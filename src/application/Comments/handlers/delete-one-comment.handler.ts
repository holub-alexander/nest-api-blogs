import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { CommentsWriteRepository } from '../repositories/comments.write.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';

export class DeleteOneCommentCommand {
  constructor(public login: string, public id: string) {}
}

@CommandHandler(DeleteOneCommentCommand)
export class DeleteOneCommentHandler {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: DeleteOneCommentCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.login);
    const comment = await this.commentsQueryRepository.findOne(command.id, null);

    if (!user || !comment) {
      throw new NotFoundException();
    }

    if (user.id !== comment.user_id) {
      throw new ForbiddenException();
    }

    const deleteComment = await this.commentsWriteRepository.deleteById(comment.id, user.id);

    if (!deleteComment) {
      throw new NotFoundException();
    }
  }
}
