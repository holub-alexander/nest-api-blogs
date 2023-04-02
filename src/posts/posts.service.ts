import { PaginationAndSortQueryParams, Paginator, SortDirections } from '../@types';
import { PostInputModel, PostViewModel } from './@types';
import { PostsMapper } from '../mappers/posts.mapper';
import { ObjectId } from 'mongodb';
import { Post, PostDocument } from '../schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostsQueryRepository } from './repositories/posts.query.repository';
import { PostsWriteRepository } from './repositories/posts.write.repository';
import { BlogsQueryRepository } from '../blogs/repositories/blogs.query.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    private postsQueryRepository: PostsQueryRepository,
    private postsWriteRepository: PostsWriteRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  public async findAll({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
  }): Promise<Paginator<PostViewModel[]>> {
    const res = await this.postsQueryRepository.findAll({
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
    });

    return {
      ...res,
      items: PostsMapper.mapPostsViewModel(res.items),
    };
  }

  public async findAllByBlogId({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
    id,
  }: PaginationAndSortQueryParams & { id: string }): Promise<Paginator<PostViewModel[]>> {
    const formatId = new ObjectId(id);
    const res = await this.postsQueryRepository.findAllByBlogId({
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      id: formatId,
    });

    return {
      ...res,
      items: PostsMapper.mapPostsViewModel(res.items),
    };
  }

  public async findOne(postId: string): Promise<PostViewModel | null> {
    const post = await this.postsQueryRepository.findOne(postId);

    if (!post) {
      return null;
    }

    return PostsMapper.mapPostViewModel(post);
  }

  public async create(body: PostInputModel): Promise<PostViewModel | null> {
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
