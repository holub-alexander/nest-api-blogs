import { LikeStatuses } from '../../../common/interfaces';
import { CommentViewModel } from '../interfaces';
import CommentEntityTypeOrm from '../../../db/entities/typeorm/comment.entity';
import ReactionEntityTypeOrm from '../../../db/entities/typeorm/reaction.entity';

export class CommentMapper {
  public static mapCommentsViewModel(comments: CommentEntityTypeOrm[]): CommentViewModel[] {
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
    comment: CommentEntityTypeOrm,
    reaction: ReactionEntityTypeOrm | null,
    likesCount: number,
    dislikesCount: number,
  ): CommentViewModel {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.user_id.toString(),
        userLogin: comment.user_login,
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
