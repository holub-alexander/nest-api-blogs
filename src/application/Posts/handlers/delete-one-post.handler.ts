import { CommandHandler } from '@nestjs/cqrs';
import { PostsTypeOrmWriteRepository } from '../repositories/typeorm/posts.write.repository';

export class DeleteOnePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteOnePostCommand)
export class DeleteOnePostHandler {
  constructor(private postsWriteRepository: PostsTypeOrmWriteRepository) {}

  public async execute(command: DeleteOnePostCommand) {
    return this.postsWriteRepository.deleteOne(command.id);
  }
}
