import { LikeStatuses } from '../../../common/interfaces';
import { CommentDocument } from '../../../db/entities/mongoose/comment.entity';
import { Reaction, ReactionDocument } from '../../../db/entities/mongoose/reaction.entity';
import { CommentViewModel } from '../interfaces';

export class CommentMapper {
  public static mapCommentsViewModel(
    comments: CommentDocument[],
    reactions: ReactionDocument[] | null,
    allReactions: { likesCount: number; dislikesCount: number }[],
  ): CommentViewModel[] {
    return comments.map((comment, index) => {
      if (!reactions) {
        return this.mapCommentViewModel(
          comment,
          null,
          allReactions[index].likesCount,
          allReactions[index].dislikesCount,
        );
      }

      const foundReactionIndex = reactions.findIndex(
        (reaction) => reaction.type === 'comment' && reaction.subjectId.toString() === comment._id.toString(),
      );

      if (foundReactionIndex > -1) {
        return this.mapCommentViewModel(
          comment,
          reactions[foundReactionIndex],
          allReactions[index].likesCount,
          allReactions[index].dislikesCount,
        );
      }

      return this.mapCommentViewModel(comment, null, allReactions[index].likesCount, allReactions[index].dislikesCount);
    });
  }

  public static mapCommentViewModel(
    comment: CommentDocument,
    reaction: Reaction | null,
    likesCount: number,
    dislikesCount: number,
  ): CommentViewModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.id.toString(),
        userLogin: comment.commentatorInfo.login,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: likesCount,
        dislikesCount: dislikesCount,
        myStatus: reaction ? reaction.likeStatus : LikeStatuses.NONE,
      },
    };
  }
}
