import { CommandHandler } from '@nestjs/cqrs';

import BlogEntityTypeOrm from '../../../db/entities/typeorm/blog.entity';
import { BlogsTypeOrmQueryRepository } from '../../Blogs/repositories/typeorm/blogs.query.repository';
import { BlogsTypeOrmWriteRepository } from '../../Blogs/repositories/typeorm/blogs.write.repository';
import { CreateBlogDto } from '../../Blogs/dto/create.dto';
import { BlogViewModel } from '../../Blogs/interfaces';
import { BlogsMapper } from '../../Blogs/mappers/blogs.mapper';

export class CreateBlogSuperAdminCommand {
  constructor(public body: CreateBlogDto) {}
}

@CommandHandler(CreateBlogSuperAdminCommand)
export class CreateBlogSuperAdminHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsTypeOrmQueryRepository,
    private readonly blogsWriteRepository: BlogsTypeOrmWriteRepository,
  ) {}

  public async execute(command: CreateBlogSuperAdminCommand): Promise<BlogViewModel | null> {
    const blog = new BlogEntityTypeOrm();

    blog.name = command.body.name;
    blog.description = command.body.description;
    blog.website_url = command.body.websiteUrl;
    blog.created_at = new Date();
    blog.is_membership = false;

    const createdBlog = await this.blogsWriteRepository.create(blog);

    return createdBlog ? BlogsMapper.mapBlogViewModel(createdBlog) : null;
  }
}
