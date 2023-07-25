import { CreateBlogDto } from '../dto/create.dto';
import { BlogViewModel } from '../interfaces';
import { Blog, BlogDocument } from '../../../db/entities/mongoose/blog.entity';
import { BlogsMapper } from '../mappers/blogs.mapper';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsQueryRepository } from '../repositories/blogs.query.repository';
import { BlogsWriteRepository } from '../repositories/blogs.write.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../Users/repositories/mongoose/users.query.repository';
import { UnauthorizedException } from '@nestjs/common';

export class CreateBlogCommand {
  constructor(public body: CreateBlogDto, public userLogin: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: Model<BlogDocument>,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  public async execute(command: CreateBlogCommand): Promise<BlogViewModel | null> {
    const user = await this.usersQueryRepository.findByLogin(command.userLogin);

    if (!user) {
      throw new UnauthorizedException();
    }

    const doc: BlogDocument = new this.BlogModel<Blog>({
      ...command.body,
      createdAt: new Date(),
      isMembership: false,
      banInfo: {
        banDate: null,
        isBanned: false,
      },
      bloggerInfo: {
        login: user.accountData.login,
        id: user._id,
        isBanned: false,
      },
    });

    await this.blogsWriteRepository.save(doc);

    return BlogsMapper.mapBlogViewModel(doc);
  }
}
