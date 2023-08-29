import { PostViewModel } from '../interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../../db/entities/mongoose/post.entity';
import { Model } from 'mongoose';
import { PostsWriteRepository } from '../repositories/mongoose/posts.write.repository';
import { BlogsQueryRepository } from '../../Blogs/repositories/mongoose/blogs.query.repository';
import { CreatePostDto } from '../dto/create.dto';
import { PostsMapper } from '../mappers/posts.mapper';
import { CommandHandler } from '@nestjs/cqrs';
import { PostsTypeOrmWriteRepository } from '../repositories/typeorm/posts.write.repository';
import { BlogsTypeOrmQueryRepository } from '../../Blogs/repositories/typeorm/blogs.query.repository';
import PostEntityTypeOrm from '../../../db/entities/typeorm/post.entity';

export class CreatePostCommand {
  constructor(public body: CreatePostDto, public blogId: number, public userId: number) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler {
  constructor(
    private readonly postsWriteRepository: PostsTypeOrmWriteRepository,
    private readonly blogsQueryRepository: BlogsTypeOrmQueryRepository,
  ) {}

  public async execute(command: CreatePostCommand): Promise<PostViewModel | null> {
    const findBlog = await this.blogsQueryRepository.findOne(command.blogId.toString());

    if (findBlog && findBlog.length > 0) {
      // const newPost = new this.PostModel<Post>({
      //   title: command.body.title,
      //   shortDescription: command.body.shortDescription,
      //   content: command.body.content,
      //   createdAt: new Date(),
      //   isBanned: false,
      //   blog: {
      //     id: findBlog._id,
      //     name: findBlog.name,
      //   },
      //   userInfo: {
      //     id: command.userId,
      //     isBanned: false,
      //   },
      //   likesInfo: {
      //     likesCount: 0,
      //     dislikesCount: 0,
      //   },
      // });

      const newPost = new PostEntityTypeOrm();

      newPost.title = command.body.title;
      newPost.short_description = command.body.shortDescription;
      newPost.content = command.body.content;
      newPost.blog_id = command.blogId;
      newPost.created_at = new Date();
      newPost.is_banned = false;
      newPost.likes_count = 0;
      newPost.dislikes_count = 0;
      newPost.user_id = command.userId;

      const post = await this.postsWriteRepository.create(newPost);

      if (post) {
        return PostsMapper.mapPostViewModel(post, null, [], 0, 0);
      }
    }

    return null;
  }
}
