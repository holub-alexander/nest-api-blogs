import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { BlogsWriteRepository } from './repositories/blogs.write.repository';
import { Paginator, SortDirections } from '../@types';
import { BlogsQueryParams } from './blogs.controller';
import { BlogInputModel, BlogViewModel } from './@types';
import { BlogsMapper } from '../mappers/blogs.mapper';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected blogsWriteRepository: BlogsWriteRepository,
  ) {}

  public async findAll({
    sortBy = 'createdAt',
    sortDirection = SortDirections.DESC,
    searchNameTerm = '',
    pageSize = 10,
    pageNumber = 1,
  }: BlogsQueryParams): Promise<Paginator<BlogViewModel[]>> {
    console.log(sortBy, sortDirection);

    const res = await this.blogsQueryRepository.findAll({
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      searchNameTerm,
    });

    return {
      ...res,
      items: BlogsMapper.mapBlogsViewModel(res.items),
    };
  }

  public async findOne(blogId: string): Promise<BlogViewModel | null> {
    const blog = await this.blogsQueryRepository.findOne(blogId);

    return blog ? BlogsMapper.mapBlogViewModel(blog) : null;
  }

  public async createBlog(body: BlogInputModel): Promise<BlogViewModel | null> {
    const doc: BlogDocument = new this.BlogModel({
      ...body,
      createdAt: new Date().toISOString(),
      isMembership: false,
    });

    await this.blogsWriteRepository.save(doc);

    return BlogsMapper.mapBlogViewModel(doc);
  }
}