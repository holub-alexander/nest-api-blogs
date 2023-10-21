import { PostViewModel } from '../interfaces';
import { CreatePostDto } from '../dto/create.dto';
import { PostsMapper } from '../mappers/posts.mapper';
import { CommandHandler } from '@nestjs/cqrs';
import { PostsWriteRepository } from '../repositories/posts.write.repository';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import PostEntityTypeOrm from '../../../db/entities/typeorm/post.entity';

export class CreatePostCommand {
  constructor(public body: CreatePostDto, public blogId: number) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler {
  constructor(
    private readonly postsWriteRepository: PostsWriteRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  public async execute(command: CreatePostCommand): Promise<PostViewModel | null> {
    const findBlog = await this.blogsQueryRepository.findOne(command.blogId.toString());

    if (findBlog && findBlog.length > 0) {
      const newPost = new PostEntityTypeOrm();

      newPost.title = command.body.title;
      newPost.short_description = command.body.shortDescription;
      newPost.content = command.body.content;
      newPost.blog_id = command.blogId;
      newPost.created_at = new Date();

      const post = await this.postsWriteRepository.create(newPost);

      if (post) {
        return PostsMapper.mapPostViewModel(post, null, [], 0, 0);
      }
    }

    return null;
  }
}
