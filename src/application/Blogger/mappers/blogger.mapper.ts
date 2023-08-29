import { CommentDocument } from '../../../db/entities/mongoose/comment.entity';
import { CommentBloggerViewModel, UserBloggerViewModel } from '../interfaces';
import { PostDocument } from '../../../db/entities/mongoose/post.entity';

import { ReactionDocument } from '../../../db/entities/mongoose/reaction.entity';
import { LikeStatuses } from '../../../common/interfaces';
import BannedUserInBlogEntity from '../../../db/entities/typeorm/banned-user-in-blog.entity';

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
            myStatus: currentReaction ? currentReaction.likeStatus : LikeStatuses.NONE,
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
          myStatus: currentReaction ? currentReaction.likeStatus : LikeStatuses.NONE,
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

  public static mapUserBloggerViewModel(items: BannedUserInBlogEntity[]): UserBloggerViewModel[] {
    return items.map((banUser): UserBloggerViewModel => {
      return {
        id: banUser.user_id.toString(),
        login: banUser.user_login,
        banInfo: {
          banDate: banUser.created_at.toISOString(),
          isBanned: banUser.is_banned,
          banReason: banUser.ban_reason,
        },
      };
    });
  }
}
