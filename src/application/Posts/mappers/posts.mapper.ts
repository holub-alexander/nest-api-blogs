import { NewestLike, PostViewModel } from '../interfaces';
import { LikeStatuses } from '../../../common/interfaces';
import PostEntityTypeOrm from '../../../db/entities/typeorm/post.entity';
import ReactionEntityTypeOrm from '../../../db/entities/typeorm/reaction.entity';

export class PostsMapper {
  public static mapNewestLikes(reactions: ReactionEntityTypeOrm[]): NewestLike[] {
    return reactions.map(
      (reaction): NewestLike => ({
        addedAt: reaction.created_at,
        userId: reaction.user_id.toString(),
        login: reaction.user_login,
      }),
    );
  }

  public static mapPostsViewModel(data: PostEntityTypeOrm[], lastReactions: ReactionEntityTypeOrm[]): PostViewModel[] {
    return data.map(
      (post): PostViewModel => ({
        id: post.id.toString(),
        title: post.title,
        shortDescription: post.short_description,
        content: post.content,
        blogId: post.blog_id.toString(),
        blogName: post.blog_name,
        createdAt: post.created_at,
        extendedLikesInfo: {
          dislikesCount: +post.dislikes_count,
          likesCount: +post.likes_count,
          myStatus: LikeStatuses.NONE,
          newestLikes: this.mapNewestLikes(lastReactions),
        },
      }),
    );
  }

  public static mapPostViewModel(
    post: PostEntityTypeOrm,
    reaction: ReactionEntityTypeOrm | null,
    lastReactions: ReactionEntityTypeOrm[] | [],
    likesCount: number,
    dislikesCount: number,
  ): PostViewModel {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.short_description,
      content: post.content,
      blogId: post.blog_id.toString(),
      blogName: post.blog_name,
      createdAt: post.created_at,
      extendedLikesInfo: {
        dislikesCount: +dislikesCount,
        likesCount: +likesCount,
        myStatus: reaction ? reaction.like_status : LikeStatuses.NONE,
        newestLikes: this.mapNewestLikes(lastReactions),
      },
    };
  }
}
