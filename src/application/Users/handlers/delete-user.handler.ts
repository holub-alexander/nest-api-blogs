import { CommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersWriteRepository } from '../repositories/users.write.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler {
  constructor(private readonly usersWriteRepository: UsersWriteRepository) {}

  public async execute(command: DeleteUserCommand) {
    const res = await this.usersWriteRepository.deleteOne(command.id);

    if (!res) {
      throw new NotFoundException({});
    }

    return res;
  }
}
