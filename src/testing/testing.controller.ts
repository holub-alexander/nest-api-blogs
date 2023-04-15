import { Controller, Delete, HttpCode } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogsWriteRepository } from '../blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../posts/repositories/posts.write.repository';
import { UsersWriteRepository } from '../users/repositories/users.write.repository';
import { CommentsWriteRepository } from '../comments/repositories/comments.write.repository';
import { ReactionsWriteRepository } from '../reactions/repositories/reactions.write.repository';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly usersWriteRepository: UsersWriteRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
    private readonly reactionsWriteRepository: ReactionsWriteRepository,
  ) {}

  @Delete('/all-data')
  @HttpCode(204)
  async deleteAll() {
    await Promise.all([
      this.blogsWriteRepository.deleteMany(),
      this.postsWriteRepository.deleteMany(),
      this.usersWriteRepository.deleteMany(),
      this.commentsWriteRepository.deleteMany(),
      this.reactionsWriteRepository.deleteMany(),
    ]);
  }
}
