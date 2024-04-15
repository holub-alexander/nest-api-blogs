import { LikeStatuses } from '../../../common/interfaces';

export interface LikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
}

export interface BloggerPostInfo {
  id: string;
  title: string;
  blogId: string;
  blogName: string;
}

export interface CommentatorInfo {
  userId: string;
  userLogin: string;
}

export interface CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfoViewModel;
}

export interface BloggerCommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfoViewModel;
  postInfo: BloggerPostInfo;
}
