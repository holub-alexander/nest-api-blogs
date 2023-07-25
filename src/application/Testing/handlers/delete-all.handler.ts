import { BlogsWriteRepository } from '../../Blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../../Posts/repositories/posts.write.repository';
import { UsersWriteRepository } from '../../Users/repositories/mongoose/users.write.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/comments.write.repository';
import { ReactionsWriteRepository } from '../../Reactions/repositories/reactions.write.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class DeleteAllCommand {}

@CommandHandler(DeleteAllCommand)
export class DeleteAllHandler {
  constructor(
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly usersWriteRepository: UsersWriteRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
  ) {}

  public async execute() {
    return Promise.all([
      this.blogsWriteRepository.deleteMany(),
      this.postsWriteRepository.deleteMany(),
      this.usersWriteRepository.deleteMany(),
      this.commentsWriteRepository.deleteMany(),
      this.reactionsWriteRepository.deleteMany(),
    ]);
  }
}
