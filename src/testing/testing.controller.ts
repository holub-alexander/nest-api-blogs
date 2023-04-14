import { Controller, Delete, HttpCode } from '@nestjs/common';
import { BlogsWriteRepository } from '../blogs/repositories/blogs.write.repository';
import { PostsWriteRepository } from '../posts/repositories/posts.write.repository';
import { UsersWriteRepository } from '../users/repositories/users.write.repository';

@Controller('testing')
export class TestingController {
  constructor(
    private blogsWriteRepository: BlogsWriteRepository,
    private postsWriteRepository: PostsWriteRepository,
    private usersWriteRepository: UsersWriteRepository,
  ) {}

  @Delete('/all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.blogsWriteRepository.deleteMany();
    await this.postsWriteRepository.deleteMany();
    await this.usersWriteRepository.deleteMany();
  }
}
