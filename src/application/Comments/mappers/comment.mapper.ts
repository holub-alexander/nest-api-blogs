import { LikeStatuses } from '../../../common/interfaces';
import { CommentViewModel } from '../interfaces';
import CommentEntity from '../../../db/entities/comment.entity';
import ReactionEntity from '../../../db/entities/reaction.entity';

export class CommentMapper {
  public static mapCommentsViewModel(comments: CommentEntity[]): CommentViewModel[] {
    return comments.map((comment) => {
      return {
        id: comment.id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.user_id.toString(),
          userLogin: comment.user_login,
        },
        createdAt: comment.created_at.toISOString(),
        likesInfo: {
          likesCount: +comment.likes_count,
          dislikesCount: +comment.dislikes_count,
          myStatus: comment.like_status || LikeStatuses.NONE,
        },
      };
    });
  }

  public static mapCommentViewModel(
    comment: CommentEntity,
    reaction: ReactionEntity | null,
    likesCount: number,
    dislikesCount: number,
  ): CommentViewModel {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.user_id.toString(),
        userLogin: comment.user.login,
      },
      createdAt: comment.created_at.toISOString(),
      likesInfo: {
        likesCount: +likesCount,
        dislikesCount: +dislikesCount,
        myStatus: reaction ? reaction.like_status : LikeStatuses.NONE,
      },
    };
  }
}
