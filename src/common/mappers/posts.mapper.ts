import { PostViewModel } from '../../posts/interfaces';
import { PostDocument } from '../../entity/post.entity';
import { LikeStatuses } from '../interfaces';

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
        extendedLikesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: LikeStatuses.NONE,
          newestLikes: [],
        },
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
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: LikeStatuses.NONE,
        newestLikes: [],
      },
    };
  }
}
