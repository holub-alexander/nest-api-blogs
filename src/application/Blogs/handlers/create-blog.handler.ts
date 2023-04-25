import { CreateBlogDto } from '../dto/create.dto';
import { BlogViewModel } from '../interfaces';
import { Blog, BlogDocument } from '../../../entity/blog.entity';
import { BlogsMapper } from '../../../common/mappers/blogs.mapper';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsQueryRepository } from '../repositories/blogs.query.repository';
import { BlogsWriteRepository } from '../repositories/blogs.write.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';

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

    const doc: BlogDocument = new this.BlogModel<Blog>({
      ...command.body,
      createdAt: new Date(),
      isMembership: false,
      bloggerInfo: {
        login: command.userLogin,
        id: user!._id ?? null,
        isBanned: false,
      },
    });

    await this.blogsWriteRepository.save(doc);

    return BlogsMapper.mapBlogViewModel(doc);
  }
}
