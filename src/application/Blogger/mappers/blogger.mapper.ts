import { CommentDocument } from '../../../entity/comment.entity';
import { CommentBloggerViewModel, UserBloggerViewModel } from '../interfaces';
import { PostDocument } from '../../../entity/post.entity';
import { BanUserDocument } from '../../../entity/ban-user.entity';
import { ReactionDocument } from '../../../entity/reaction.entity';
import { LikeStatuses } from '../../../common/interfaces';

export class BloggerMapper {
  public static mapCommentBloggerViewModel(
    comments: CommentDocument[],
    posts: PostDocument[],
    reactions: ReactionDocument[],
  ) {
    return comments.map((comment): CommentBloggerViewModel => {
      const post = posts.find((post) => post._id.toString() === comment.postId.toString());
      const currentReaction = reactions.find(
        (reaction) => reaction.type === 'comment' && reaction.subjectId.toString() === comment._id.toString(),
      );

      if (!post) {
        return {
          id: comment._id.toString(),
          content: comment.content,
          commentatorInfo: {
            userId: comment.commentatorInfo.id.toString(),
            userLogin: comment.commentatorInfo.login,
          },
          likesInfo: {
            dislikesCount: comment.likesInfo.dislikesCount,
            likesCount: comment.likesInfo.likesCount,
            myStatus: currentReaction ? currentReaction.likeStatus : LikeStatuses.LIKE,
          },
          createdAt: comment.createdAt,
        };
      }

      return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.id.toString(),
          userLogin: comment.commentatorInfo.login,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          dislikesCount: comment.likesInfo.dislikesCount,
          likesCount: comment.likesInfo.likesCount,
          myStatus: currentReaction ? currentReaction.likeStatus : LikeStatuses.LIKE,
        },
        postInfo: {
          id: post._id.toString(),
          title: post.title,
          blogId: post.blog.id.toString(),
          blogName: post.blog.name,
        },
      };
    });
  }

  public static mapUserBloggerViewModel(items: BanUserDocument[]): UserBloggerViewModel[] {
    return items.map((banUser): UserBloggerViewModel => {
      return {
        id: banUser.user.id.toString(),
        login: banUser.user.login,
        banInfo: {
          banDate: banUser.banInfo.banDate,
          isBanned: banUser.banInfo.isBanned,
          banReason: banUser.banInfo.banReason,
        },
      };
    });
  }
}
