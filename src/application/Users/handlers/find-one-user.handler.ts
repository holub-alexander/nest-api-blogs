import { CommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../repositories/users.query.repository';

export class FindOneUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(FindOneUserCommand)
export class FindOneUserHandler {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  public async execute(command: FindOneUserCommand) {
    return this.usersQueryRepository.findUserById(command.userId);
  }
}
