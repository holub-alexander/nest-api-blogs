import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentsTypeOrmQueryRepository } from '../repositories/typeorm/comments.query.repository';
import { CommentsTypeOrmWriteRepository } from '../repositories/typeorm/comments.write.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';

export class DeleteOneCommentCommand {
  constructor(public login: string, public id: string) {}
}

@CommandHandler(DeleteOneCommentCommand)
export class DeleteOneCommentHandler {
  constructor(
    private readonly commentsQueryRepository: CommentsTypeOrmQueryRepository,
    private readonly commentsWriteRepository: CommentsTypeOrmWriteRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
  ) {}

  public async execute(command: DeleteOneCommentCommand) {
    const user = await this.usersQueryRepository.findByLogin(command.login);
    const comment = await this.commentsQueryRepository.findOne(command.id, null);

    if (!user || !comment || comment.length === 0) {
      throw new NotFoundException();
    }

    if (user.id !== comment[0].user_id) {
      throw new ForbiddenException();
    }

    const deleteComment = await this.commentsWriteRepository.deleteById(comment[0].id, user.id);

    if (!deleteComment) {
      throw new NotFoundException();
    }
  }
}
