import { NewestLike, PostViewModel } from '../../application/Posts/interfaces';
import { PostDocument } from '../../entity/post.entity';
import { LikeStatuses } from '../interfaces';
import { ReactionDocument } from '../../entity/reaction.entity';

export class PostsMapper {
  public static mapNewestLikes(reactions: ReactionDocument[]): NewestLike[] {
    return reactions.map(
      (reaction): NewestLike => ({
        addedAt: reaction.createdAt,
        userId: reaction.user.id.toString(),
        login: reaction.user.login,
      }),
    );
  }

  public static mapPostsViewModel(data: PostDocument[], lastReactions: ReactionDocument[]): PostViewModel[] {
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
          dislikesCount: post.likesInfo.dislikesCount,
          likesCount: post.likesInfo.likesCount,
          myStatus: LikeStatuses.NONE,
          newestLikes: this.mapNewestLikes(lastReactions),
        },
      }),
    );
  }

  public static mapPostViewModel(
    post: PostDocument,
    reaction: ReactionDocument | null,
    lastReactions: ReactionDocument[] | [],
  ): PostViewModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blog.id.toString(),
      blogName: post.blog.name,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesInfo.likesCount,
        dislikesCount: post.likesInfo.dislikesCount,
        myStatus: reaction ? reaction.likeStatus : LikeStatuses.NONE,
        newestLikes: this.mapNewestLikes(lastReactions),
      },
    };
  }
}
