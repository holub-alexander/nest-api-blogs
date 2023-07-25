import { PostViewModel } from '../interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../../db/entities/mongoose/post.entity';
import { Model } from 'mongoose';
import { PostsWriteRepository } from '../repositories/posts.write.repository';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { CreatePostDto } from '../dto/create.dto';
import { PostsMapper } from '../mappers/posts.mapper';
import { CommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';

export class CreatePostCommand {
  constructor(public body: CreatePostDto, public blogId: string, public userId: ObjectId) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  public async execute(command: CreatePostCommand): Promise<PostViewModel | null> {
    const findBlog = await this.blogsQueryRepository.findOne(command.blogId);

    if (findBlog) {
      const doc = new this.PostModel<Post>({
        title: command.body.title,
        shortDescription: command.body.shortDescription,
        content: command.body.content,
        createdAt: new Date(),
        isBanned: false,
        blog: {
          id: findBlog._id,
          name: findBlog.name,
        },
        userInfo: {
          id: command.userId,
          isBanned: false,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
      });

      await this.postsWriteRepository.save(doc);

      return PostsMapper.mapPostViewModel(doc, null, [], 0, 0);
    }

    return null;
  }
}
