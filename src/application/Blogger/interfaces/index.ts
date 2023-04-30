import { CommentViewModel } from '../../Comments/interfaces';

export interface PostInfo {
  id: string;
  title: string;
  blogId: string;
  blogName: string;
}

export interface CommentBloggerViewModel extends Omit<CommentViewModel, 'likesInfo'> {
  postInfo: PostInfo;
}
