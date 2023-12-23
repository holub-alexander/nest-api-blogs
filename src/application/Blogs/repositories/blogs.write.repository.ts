import { Injectable } from '@nestjs/common';
import { UpdateBlogDto } from '../dto/update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BlogEntity from '../../../db/entities/blog.entity';

@Injectable()
export class BlogsWriteRepository {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
  ) {}

  public create() {
    return this.blogRepository.create();
  }

  public async save(createdBlog: BlogEntity): Promise<BlogEntity | null> {
    return this.blogRepository.save(createdBlog);
  }

  public async deleteOne(blogId: string): Promise<boolean> {
    if (!blogId || !Number.isInteger(+blogId)) {
      return false;
    }

    const res = await this.blogRepository.delete({ id: +blogId });

    return !res.affected ? false : res.affected > 0;
  }

  public async updateOne(blogId: string, data: UpdateBlogDto): Promise<boolean> {
    if (!blogId || !Number.isInteger(+blogId)) {
      return false;
    }

    const res = await this.blogRepository.update(
      { id: +blogId },
      {
        name: data.name,
        description: data.description,
        website_url: data.websiteUrl,
      },
    );

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.blogRepository.delete({});

    return !res.affected ? false : res.affected > 0;
  }
}
