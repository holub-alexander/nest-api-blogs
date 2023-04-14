import { BlogViewModel } from './interfaces';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBlogDto } from './dto/create.dto';
import { Blog, BlogDocument } from '../entity/blog.entity';
import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { PaginationBlogDto } from './dto/pagination-blog.dto';
import { BlogsMapper } from '../common/mappers/blogs.mapper';
import { BlogsWriteRepository } from './repositories/blogs.write.repository';
import { Paginator } from '../common/interfaces';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: Model<BlogDocument>,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsWriteRepository: BlogsWriteRepository,
  ) {}

  public async findAll(paginationSortBlogDto: PaginationBlogDto): Promise<Paginator<BlogViewModel[]>> {
    const res = await this.blogsQueryRepository.findAll(paginationSortBlogDto);

    return {
      ...res.meta,
      items: BlogsMapper.mapBlogsViewModel(res.items),
    };
  }

  public async findOne(blogId: string): Promise<BlogViewModel | null> {
    const blog = await this.blogsQueryRepository.findOne(blogId);

    return blog ? BlogsMapper.mapBlogViewModel(blog) : null;
  }

  public async create(body: CreateBlogDto): Promise<BlogViewModel | null> {
    const doc: BlogDocument = new this.BlogModel({
      ...body,
      createdAt: new Date().toISOString(),
      isMembership: false,
    });

    await this.blogsWriteRepository.save(doc);

    return BlogsMapper.mapBlogViewModel(doc);
  }
}
