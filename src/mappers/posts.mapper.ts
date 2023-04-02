import { PostDocument } from '../schemas/post.schema';
import { PostViewModel } from '../posts/@types';

export class PostsMapper {
  public static mapPostsViewModel(data: PostDocument[]): PostViewModel[] {
    return data.map(
      (post): PostViewModel => ({
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blog.id.toString(),
        blogName: post.blog.name,
        createdAt: post.createdAt,
      }),
    );
  }

  public static mapPostViewModel(post: PostDocument): PostViewModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blog.id.toString(),
      blogName: post.blog.name,
      createdAt: post.createdAt,
    };
  }
}
