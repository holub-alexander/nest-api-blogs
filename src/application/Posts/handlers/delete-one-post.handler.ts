import { PostsWriteRepository } from '../repositories/posts.write.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class DeleteOnePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteOnePostCommand)
export class DeleteOnePostHandler {
  constructor(private postsWriteRepository: PostsWriteRepository) {}

  public async execute(command: DeleteOnePostCommand) {
    return this.postsWriteRepository.deleteOne(command.id);
  }
}
