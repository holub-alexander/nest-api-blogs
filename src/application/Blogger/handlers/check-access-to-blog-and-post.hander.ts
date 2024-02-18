import { CommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { PostsQueryRepository } from '../../Posts/repositories/posts.query.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class CheckAccessToBlogAndPostCommand {
  constructor(public blogId: string, public postId: string, public userLogin: string) {}
}

@CommandHandler(CheckAccessToBlogAndPostCommand)
export class CheckAccessToBlogAndPostHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  public async execute(command: CheckAccessToBlogAndPostCommand) {
    const foundBlog = await this.blogsQueryRepository.findOne(command.blogId);
    const foundPost = await this.postsQueryRepository.findOne(command.postId);

    if (!foundBlog || !foundPost) {
      throw new NotFoundException({});
    }

    if (foundBlog.user.login !== command.userLogin || foundPost.blog_id !== foundBlog.id) {
      throw new ForbiddenException();
    }

    return foundBlog;
  }
}
