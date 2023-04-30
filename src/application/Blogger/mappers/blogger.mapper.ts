import { CommentDocument } from '../../../entity/comment.entity';
import { CommentBloggerViewModel } from '../interfaces';
import { PostDocument } from '../../../entity/post.entity';
import { CommentViewModel } from '../../Comments/interfaces';

export class BloggerMapper {
  public static mapCommentBloggerViewModel(
    comments: CommentDocument[],
    posts: PostDocument[],
  ): CommentBloggerViewModel[] | Omit<CommentViewModel, 'likesInfo'>[] {
    return comments.map((comment): CommentBloggerViewModel | Omit<CommentViewModel, 'likesInfo'> => {
      const post = posts.find((post) => post._id.toString() === comment.postId.toString());

      if (!post) {
        return {
          id: comment._id.toString(),
          content: comment.content,
          commentatorInfo: {
            userId: comment.commentatorInfo.id.toString(),
            userLogin: comment.commentatorInfo.login,
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
        postInfo: {
          id: post._id.toString(),
          title: post.title,
          blogId: post.blog.id.toString(),
          blogName: post.blog.name,
        },
      };
    });
  }
}
