import { LikeStatuses } from '../interfaces';
import { Comment, CommentDocument } from '../../entity/comment.entity';
import { Reaction, ReactionDocument } from '../../entity/reaction.entity';
import { CommentViewModel } from '../../application/Comments/interfaces';

export class CommentMapper {
  public static mapCommentsViewModel(
    comments: CommentDocument[],
    reactions: ReactionDocument[] | null,
  ): CommentViewModel[] {
    return comments.map((comment) => {
      if (!reactions) {
        return this.mapCommentViewModel(comment, null);
      }

      const foundReactionIndex = reactions.findIndex(
        (reaction) => reaction.type === 'comment' && reaction.subjectId.toString() === comment._id.toString(),
      );

      if (foundReactionIndex > -1) {
        return this.mapCommentViewModel(comment, reactions[foundReactionIndex]);
      }

      return this.mapCommentViewModel(comment, null);
    });
  }

  public static mapCommentViewModel(comment: CommentDocument, reaction: Reaction | null): CommentViewModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.id.toString(),
        userLogin: comment.commentatorInfo.login,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: reaction ? reaction.likeStatus : LikeStatuses.NONE,
      },
    };
  }
}
