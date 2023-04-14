import { PostViewModel } from './interfaces';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../blogs/repositories/blogs.query.repository';
import { PostsMapper } from '../common/mappers/posts.mapper';
import { CreatePostDto } from './dto/create.dto';
import { PostsWriteRepository } from './repositories/posts.write.repository';
import { PostsQueryRepository } from './repositories/posts.query.repository';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { Paginator } from '../common/interfaces';
import { Post, PostDocument } from '../entity/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  public async findAll(paginationQueryParams: PaginationOptionsDto): Promise<Paginator<PostViewModel[]>> {
    const { meta, items } = await this.postsQueryRepository.findAll(paginationQueryParams);

    return {
      ...meta,
      items: PostsMapper.mapPostsViewModel(items),
    };
  }

  public async findAllByBlogId(
    paginationOptions: PaginationOptionsDto,
    id: string,
  ): Promise<Paginator<PostViewModel[]>> {
    const formatId = new ObjectId(id);
    const { meta, items } = await this.postsQueryRepository.findAllByBlogId(paginationOptions, formatId);

    return {
      ...meta,
      items: PostsMapper.mapPostsViewModel(items),
    };
  }

  public async findOne(postId: string): Promise<PostViewModel | null> {
    const post = await this.postsQueryRepository.findOne(postId);

    if (!post) {
      return null;
    }

    return PostsMapper.mapPostViewModel(post);
  }

  public async create(body: CreatePostDto): Promise<PostViewModel | null> {
    const findBlog = await this.blogsQueryRepository.findOne(body.blogId);

    if (findBlog) {
      const doc: PostDocument = new this.PostModel({
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        createdAt: new Date().toISOString(),
        blog: {
          id: new ObjectId(findBlog._id),
          name: findBlog.name,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
      });

      await this.postsWriteRepository.save(doc);

      return PostsMapper.mapPostViewModel(doc);
    }

    return null;
  }
}
