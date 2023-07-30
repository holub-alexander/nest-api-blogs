import { CommandHandler } from '@nestjs/cqrs';
import { UsersTypeOrmQueryRepository } from '../repositories/typeorm/users.query.repository';

export class FindOneUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(FindOneUserCommand)
export class FindOneUserHandler {
  constructor(private usersQueryRepository: UsersTypeOrmQueryRepository) {}

  public async execute(command: FindOneUserCommand) {
    return this.usersQueryRepository.findUserById(command.userId);
  }
}
