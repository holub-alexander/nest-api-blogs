import { CommandHandler } from '@nestjs/cqrs';

import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { BlogsWriteRepository } from '../../Blogs/repositories/blogs.write.repository';
import { CreateBlogDto } from '../../Blogs/dto/create.dto';
import { BlogViewModel } from '../../Blogs/interfaces';
import { BlogsMapper } from '../../Blogs/mappers/blogs.mapper';

export class CreateBlogSuperAdminCommand {
  constructor(public body: CreateBlogDto) {}
}

@CommandHandler(CreateBlogSuperAdminCommand)
export class CreateBlogSuperAdminHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsWriteRepository: BlogsWriteRepository,
  ) {}

  public async execute(command: CreateBlogSuperAdminCommand): Promise<BlogViewModel | null> {
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
