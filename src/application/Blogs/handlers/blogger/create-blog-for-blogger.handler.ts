import { CommandHandler } from '@nestjs/cqrs';
import { BlogsWriteRepository } from '../../repositories/blogs.write.repository';
import { CreateBlogDto } from '../../dto/create.dto';
import { BlogViewModel } from '../../interfaces';
import { BlogsMapper } from '../../mappers/blogs.mapper';
import { UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../../Users/repositories/users.query.repository';

export class CreateBlogForBloggerCommand {
  constructor(public body: CreateBlogDto, public userLogin: string) {}
}

@CommandHandler(CreateBlogForBloggerCommand)
export class CreateBlogForBloggerHandler {
  constructor(
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: CreateBlogForBloggerCommand): Promise<BlogViewModel | null> {
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
    blog.user = user;

    const createdBlog = await this.blogsWriteRepository.save(blog);

    return createdBlog ? BlogsMapper.mapBlogViewModel(createdBlog) : null;
  }
}
