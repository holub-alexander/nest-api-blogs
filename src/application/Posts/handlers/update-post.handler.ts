import { UpdatePostDto } from '../dto/update.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { PostsWriteRepository } from '../repositories/posts.write.repository';

export class UpdatePostCommand {
  constructor(public postId: string, public body: UpdatePostDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler {
  constructor(private postsWriteRepository: PostsWriteRepository) {}

  public async execute(command: UpdatePostCommand) {
    return this.postsWriteRepository.updateOne(command.postId, command.body);
  }
}
