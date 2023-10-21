import { CreateBlogDto } from '../dto/create.dto';
import { BlogViewModel } from '../interfaces';
import { BlogsMapper } from '../mappers/blogs.mapper';
import { CommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { BlogsTypeOrmQueryRepository } from '../repositories/typeorm/blogs.query.repository';
import { BlogsTypeOrmWriteRepository } from '../repositories/typeorm/blogs.write.repository';
import BlogEntityTypeOrm from '../../../db/entities/typeorm/blog.entity';

export class CreateBlogCommand {
  constructor(public body: CreateBlogDto, public userLogin: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler {
  constructor(
    private readonly blogsQueryRepository: BlogsTypeOrmQueryRepository,
    private readonly blogsWriteRepository: BlogsTypeOrmWriteRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
  ) {}

  public async execute(command: CreateBlogCommand): Promise<BlogViewModel | null> {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new UnauthorizedException();
    }

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
