import { UsersQueryRepository } from '../repositories/mongoose/users.query.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class FindOneUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(FindOneUserCommand)
export class FindOneUserHandler {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  public async execute(command: FindOneUserCommand) {
    return this.usersQueryRepository.getUserById(command.userId);
  }
}
