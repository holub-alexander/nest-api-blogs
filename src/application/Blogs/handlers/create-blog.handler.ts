import { CreateBlogDto } from '../dto/create.dto';
import { BlogViewModel } from '../interfaces';
import { BlogsMapper } from '../mappers/blogs.mapper';
import { CommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { BlogsQueryRepository } from '../repositories/blogs.query.repository';
import { BlogsWriteRepository } from '../repositories/blogs.write.repository';

export class CreateBlogCommand {
  constructor(public body: CreateBlogDto, public userLogin: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: CreateBlogCommand): Promise<BlogViewModel | null> {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new UnauthorizedException();
    }

    const blog = this.blogsWriteRepository.create();

    blog.name = command.body.name;
    blog.description = command.body.description;
    blog.website_url = command.body.websiteUrl;
    blog.created_at = new Date();
    blog.is_membership = false;

    const createdBlog = await this.blogsWriteRepository.save(blog);

    return createdBlog ? BlogsMapper.mapBlogViewModel(createdBlog) : null;
  }
}
